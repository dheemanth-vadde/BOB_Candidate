import { useState, useEffect } from "react";
import Accordion from "react-bootstrap/Accordion";
import EducationForm from "./EducationForm";
import profileApi from "../services/profile.api";
import { getEducationLevelIdFromQualification, mapEducationApiToUi } from "../mappers/EducationMapper";
import { useSelector } from "react-redux";
import masterApi from '../../../services/master.api';
import { toast } from "react-toastify";
import Loader from "./Loader";

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
  const [hasApiEducations, setHasApiEducations] = useState(false);
  const [educations, setEducations] = useState([]);
  const [masterData, setMasterData] = useState(EMPTY_MASTER_DATA);
  const [loading, setLoading] = useState(false);

  const fetchEducationDetails = async () => {
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

      if (!list.length) {
        setHasApiEducations(false);
        setEducations([]);
        return;
      }

      setHasApiEducations(true);

      const mapped = list.map(item => {
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
          data: mapEducationApiToUi(item, mandatoryQualifications)
        };
      });

      setEducations(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load education details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducationDetails();
  }, [candidateId]);

  const handleSaveAndNext = () => {
    if (educations.filter(e => e.educationId).length === 0) {
      toast.error("Please add at least 1 education");
      return;
    }
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

  return (
    <div className="px-4 py-3 border rounded bg-white accordion_div">
        <Accordion>
          {hasApiEducations ? (
            educations.map((edu, index) => (
              <Accordion.Item key={edu.uiId} eventKey={String(index)}>
                <Accordion.Header>
                  <p className="tab_headers mb-0">{edu.label}</p>
                </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    educationId={edu.educationId}
                    existingData={edu.data}
                    masterData={masterData}
                    refreshEducation={fetchEducationDetails}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))
          ) : (
            <>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <p className="tab_headers mb-0">10th Standard</p>
                  </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    fixedEducationLevelId={STATIC_EDUCATION_LEVEL_MAP.tenth}
                    disableEducationLevel
                    // showDegree={false}
                    // showSpecialization={false}
                    masterData={masterData}
                    refreshEducation={fetchEducationDetails}
                  />
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <p className="tab_headers mb-0">Intermediate / Diploma</p>
                  </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    fixedEducationLevelId={STATIC_EDUCATION_LEVEL_MAP.intermediate}
                    disableEducationLevel
                    masterData={masterData}
                    refreshEducation={fetchEducationDetails}
                  />
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <p className="tab_headers mb-0">Graduation</p>
                  </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    fixedEducationLevelId={STATIC_EDUCATION_LEVEL_MAP.graduation}
                    disableEducationLevel
                    masterData={masterData}
                    refreshEducation={fetchEducationDetails}
                  />
                </Accordion.Body>
              </Accordion.Item>

              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  <p className="tab_headers mb-0">Post Graduation</p>
                  </Accordion.Header>
                <Accordion.Body>
                  <EducationForm
                    goNext={goNext}
                    fixedEducationLevelId={STATIC_EDUCATION_LEVEL_MAP.postGraduation}
                    disableEducationLevel
                    masterData={masterData}
                    refreshEducation={fetchEducationDetails}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </>
          )}
        </Accordion>

      <div className="d-flex justify-content-center">
        <button
          className="btn blue-button"
          onClick={() =>
            setEducations(prev => [
              ...prev,
              {
                id: crypto.randomUUID(),
                label: "Select Education Level",
                data: null
              }
            ])
          }
        >
          + Add Education
        </button>
      </div>

      {/* Bottom Nav Buttons — UNCHANGED */}
      <div className="d-flex justify-content-between mt-5">
        <button
          type="button"
          className="btn btn-outline-secondary text-muted"
          onClick={goBack}
        >
          Back
        </button>

        <button
          type="button"
          className="btn btn-primary"
          style={{
            backgroundColor: "#ff7043",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            color: "#fff"
          }}
          onClick={handleSaveAndNext}
        >
          Save and Next
        </button>
      </div>

      {loading && (
				<Loader />
			)}

    </div>
  );
};

export default EducationDetails;
