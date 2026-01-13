import { useState, useEffect, useRef, createRef, useCallback } from "react";
import Accordion from "react-bootstrap/Accordion";
import Badge from "react-bootstrap/Badge";
import EducationForm from "./EducationForm";
import profileApi from "../services/profile.api";
import { getEducationLevelIdFromQualification, mapEducationApiToUi } from "../mappers/EducationMapper";
import { useSelector, useDispatch } from "react-redux";
import { removeParsedEducationById } from "../store/resumeSlice";
import masterApi from '../../../services/master.api';
import { toast } from "react-toastify";
import Loader from "./Loader";
import BackButtonWithConfirmation from "../../../shared/components/BackButtonWithConfirmation";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const EducationDetails = ({ goNext, goBack }) => {
  const EMPTY_MASTER_DATA = {
    educationLevels: [],
    boards: [],
    specializations: [],
    educationTypes: []
  };
  const user = useSelector((state) => state?.user?.user?.data);
  const candidateId = user?.user?.id;
  const STATIC_EDUCATION_LEVEL_MAP = {
    tenth: "118570f4-a4d6-4fde-b4b2-b8232ae1c6b3",
    intermediate: "9b1799eb-9869-48e3-ab2f-a338f511e2be",
    diploma: "2772f742-9f7a-4825-b788-a5ab9c5962d3",
    graduation: "f920024c-8a0b-49e2-98cb-17bcc9bea890",
    postGraduation: "9b1cb3f5-a037-4468-8eb5-076968e7a84e"
  };
  const MANDATORY_LEVEL_IDS = [
    STATIC_EDUCATION_LEVEL_MAP.tenth,
    STATIC_EDUCATION_LEVEL_MAP.intermediate
  ];
  const [educations, setEducations] = useState([]);
  const [masterData, setMasterData] = useState(EMPTY_MASTER_DATA);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const parsedResume = useSelector((state) => state.resume?.parsed || null);
  const dispatch = useDispatch();
  const formRefs = useRef({});
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);

  const getRef = (key) => {
    if (!formRefs.current[key]) {
      formRefs.current[key] = createRef();
    }
    return formRefs.current[key];
  };

  const handleDeleteEducation = (parsedId) => {
    setEducations(prev => prev.filter(edu => edu.parsedId !== parsedId));
  };

  const fetchEducationDetails = useCallback(async (forceUseApi = false) => {
    setLoading(true);
    try {
      const [eduRes, masterRes] = await Promise.all([
        profileApi.getEducationDetails(candidateId),
        masterApi.getMasterData()
      ]);

      const list = eduRes?.data || [];
      const raw = masterRes?.data?.data || {};
      const mandatoryQualifications = raw.mandatoryQualification || [];

      setMasterData({
        educationLevels: raw.educationLevels || [],
        boards: raw.mandatoryQualification || [],
        specializations: raw.specializationMaster || [],
        educationTypes: raw.educationTypeMaster || []
      });

      // Map API data
      const apiMapped = list.map(item => {
        const qualificationId = item.education.educationQualificationsId;
        const levelId = getEducationLevelIdFromQualification(
          qualificationId,
          mandatoryQualifications
        );

        return {
          uiId: crypto.randomUUID(),
          educationId: item.education.educationId,
          educationLevelId: levelId,
          label: getEducationLabelFromQualification(
            qualificationId,
            mandatoryQualifications,
            raw.educationLevels
          ),
          data: mapEducationApiToUi(item, mandatoryQualifications),
          parsedId: null // API entries don't have parsedId
        };
      });

      // Map parsed resume data (always append to API data)
      const mapLevelToId = (levelStr) => {
        if (!levelStr) return STATIC_EDUCATION_LEVEL_MAP.graduation;
        const s = levelStr.toLowerCase();
        if (/bachelor|graduate|b\.tech|btech|b\.e|bsc|mba|ms/.test(s)) return STATIC_EDUCATION_LEVEL_MAP.graduation;
        if (/post|master|m\.tech|mtech|m\.e|mcom|msc/.test(s)) return STATIC_EDUCATION_LEVEL_MAP.postGraduation;
        if (/intermediate|diploma|12th|higher secondary|hsc/.test(s)) return STATIC_EDUCATION_LEVEL_MAP.intermediate;
        if (/high school|10th|ssc|secondary|school/.test(s)) return STATIC_EDUCATION_LEVEL_MAP.tenth;
        return STATIC_EDUCATION_LEVEL_MAP.graduation;
      };

      const parsedMapped = (parsedResume?.education || []).map((ed) => {
        const levelId = mapLevelToId(ed.level);
        const label = (raw.educationLevels || []).find(l => l.documentTypeId === levelId)?.documentName || ed.level || 'Education';
        const passingYear = ed.passingYear || '';
        const date = passingYear ? `${passingYear}-01-01` : "";

        return {
          uiId: crypto.randomUUID(),
          educationId: null,
          educationLevelId: levelId,
          label,
          parsedId: ed.__tempId,
          data: {
            educationLevel: levelId,
            university: '',
            college: ed.school || ed.institution || '',
            specialization: '',
            educationType: '',
            from: date,
            to: date,
            percentage: ed.percentage || '',
            document: null
          }
        };
      });

      // Combine API + Parsed data
      const combined = [...apiMapped, ...parsedMapped];

      if (combined.length === 0) {
        setEducations([]);
        setIsDirty(false);
        return;
      }

      setEducations(combined);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load education details");
    } finally {
      setLoading(false);
    }
  }, [parsedResume, candidateId]);

  useEffect(() => {
    fetchEducationDetails();
  }, [fetchEducationDetails]);

  const handleSaveAndNext = () => {
    // Validate all rendered EducationForm components via refs
    if (!educations || educations.length === 0) {
      toast.error("Please add at least 1 education");
      return;
    }

    for (let i = 0; i < educations.length; i++) {
      const key = String(i);
      const ref = getRef(key);
      if (ref && ref.current && typeof ref.current.validate === 'function') {
        const result = ref.current.validate();
        if (!result.isValid) {
          setActiveAccordionKey(key);
          toast.error("Please fill required fields in the highlighted education");
          return;
        }
      }
    }

    // All valid
    goNext();
  };

  const getEducationLabelFromQualification = (
    educationQualificationsId,
    mandatoryQualifications,
    educationLevels
  ) => {
    const levelId = getEducationLevelIdFromQualification(
      educationQualificationsId,
      mandatoryQualifications
    );

    return (
      educationLevels.find(
        lvl => lvl.documentTypeId === levelId
      )?.documentName || "Education"
    );
  };

  const getExistingRanges = (excludeUiId = null) =>
  educations
    .filter(e => e.data?.from && e.data?.to && e.uiId !== excludeUiId)
    .map(e => ({
      educationId: e.educationId,
      from: e.data.from,
      to: e.data.to,
      label: e.label
    }));

  return (
    <div className="px-4 py-3 border bg-white accordion_div">
        <Accordion activeKey={activeAccordionKey} onSelect={(k) => setActiveAccordionKey(k)}>
          {educations.length > 0 ? (
            educations.map((edu, index) => (
              <Accordion.Item key={edu.uiId} eventKey={String(index)}>
                <Accordion.Header>
                  <div className="d-flex align-items-center justify-content-between w-100 gap-2">
                    <p className="tab_headers mb-0">{edu.label}</p>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    educationId={edu.educationId}
                    existingData={edu.data}
                    parsedId={edu.parsedId}
                    masterData={masterData}
                    refreshEducation={fetchEducationDetails}
                    onDirtyChange={setIsDirty}
                    onDelete={handleDeleteEducation}
                    ref={getRef(String(index))}
                    existingRanges={getExistingRanges(edu.uiId)}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))
          ) : null}
        </Accordion>

      <div className="d-flex justify-content-center">
        <button
          className="btn blue-button"
          onClick={() => {
            setEducations(prev => {
              const nextIndex = prev.length; // index of the new accordion
              const updated = [
                ...prev,
                {
                  uiId: crypto.randomUUID(),
                  educationId: null,
                  label: "Select Education Level",
                  data: null,
                  parsedId: crypto.randomUUID()
                }
              ];

              // OPEN the newly added accordion and close others
              setActiveAccordionKey(String(nextIndex));

              return updated;
            });
          }}
        >
          + Add Education
        </button>
      </div>

      {/* Bottom Nav Buttons — UNCHANGED */}
      <div className="d-flex justify-content-between mt-5">
        <BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />

        <button
          type="button"
          className="btn btn-primary"
          style={{
            backgroundColor: "#ff7043",
            border: "none",
            padding: "0.6rem 2rem",
            borderRadius: "4px",
            color: "#fff",
            fontSize: '0.875rem'
          }}
          onClick={handleSaveAndNext}
        >
          Save & Next
          <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
        </button>
      </div>

      {loading && (
				<Loader />
			)}

    </div>
  );
};

export default EducationDetails;
