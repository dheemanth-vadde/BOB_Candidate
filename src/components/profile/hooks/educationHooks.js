import { useState, useEffect, useRef, createRef, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import profileApi from "../services/profile.api";
import masterApi from "../../../services/master.api";
import { toast } from "react-toastify";
import {
  getEducationLevelIdFromQualification,
  mapEducationApiToUi
} from "../mappers/EducationMapper";
import { removeParsedEducationById } from "../store/resumeSlice";

const EMPTY_MASTER_DATA = {
  educationLevels: [],
  boards: [],
  specializations: [],
  educationTypes: []
};

const STATIC_EDUCATION_LEVEL_MAP = {
  tenth: "118570f4-a4d6-4fde-b4b2-b8232ae1c6b3",
  intermediate: "9b1799eb-9869-48e3-ab2f-a338f511e2be",
  diploma: "2772f742-9f7a-4825-b788-a5ab9c5962d3",
  graduation: "f920024c-8a0b-49e2-98cb-17bcc9bea890",
  postGraduation: "9b1cb3f5-a037-4468-8eb5-076968e7a84e"
};

export const useEducationDetails = ({ goNext }) => {
  const user = useSelector(state => state?.user?.user?.data);
  const parsedResume = useSelector(state => state.resume?.parsed || null);
  const candidateId = user?.user?.id;

  const dispatch = useDispatch();

  const [educations, setEducations] = useState([]);
  const [masterData, setMasterData] = useState(EMPTY_MASTER_DATA);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeAccordionKey, setActiveAccordionKey] = useState(null);

  const formRefs = useRef({});

  /* -------------------- REFS -------------------- */
  const getRef = (key) => {
    if (!formRefs.current[key]) {
      formRefs.current[key] = createRef();
    }
    return formRefs.current[key];
  };

  /* -------------------- HELPERS -------------------- */
  const mapParsedLevelToId = (levelStr) => {
    if (!levelStr) return STATIC_EDUCATION_LEVEL_MAP.graduation;
    const s = levelStr.toLowerCase();

    if (/post|master|m\.tech|mtech|m\.e|msc|mba/.test(s))
      return STATIC_EDUCATION_LEVEL_MAP.postGraduation;
    if (/bachelor|graduate|b\.tech|btech|b\.e|bsc/.test(s))
      return STATIC_EDUCATION_LEVEL_MAP.graduation;
    if (/intermediate|12th|higher secondary|hsc|diploma/.test(s))
      return STATIC_EDUCATION_LEVEL_MAP.intermediate;
    if (/10th|ssc|secondary|school/.test(s))
      return STATIC_EDUCATION_LEVEL_MAP.tenth;

    return STATIC_EDUCATION_LEVEL_MAP.graduation;
  };

  const getEducationLabel = (qualificationId, mandatoryQualifications, educationLevels) => {
    const levelId = getEducationLevelIdFromQualification(
      qualificationId,
      mandatoryQualifications
    );

    return (
      educationLevels.find(l => l.documentTypeId === levelId)?.documentName ||
      "Education"
    );
  };

  /* -------------------- FETCH DATA -------------------- */
  const fetchEducationDetails = useCallback(async () => {
    if (!candidateId) return;

    setLoading(true);
    try {
      const [eduRes, masterRes] = await Promise.all([
        profileApi.getEducationDetails(),
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
          label: getEducationLabel(
            qualificationId,
            mandatoryQualifications,
            raw.educationLevels
          ),
          data: mapEducationApiToUi(item, mandatoryQualifications),
          parsedId: null
        };
      });

      const parsedMapped = (parsedResume?.education || []).map(ed => {
        const levelId = mapParsedLevelToId(ed.level);
        const label =
          raw.educationLevels?.find(l => l.documentTypeId === levelId)?.documentName ||
          ed.level ||
          "Education";

        const year = ed.passingYear || "";
        const date = year ? `${year}-01-01` : "";

        return {
          uiId: crypto.randomUUID(),
          educationId: null,
          educationLevelId: levelId,
          label,
          parsedId: ed.__tempId,
          data: {
            educationLevel: levelId,
            university: "",
            college: ed.school || ed.institution || "",
            specialization: "",
            educationType: "",
            from: date,
            to: date,
            percentage: ed.percentage || "",
            document: null
          }
        };
      });

      setEducations([...apiMapped, ...parsedMapped]);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load education details");
    } finally {
      setLoading(false);
    }
  }, [candidateId, parsedResume]);

  useEffect(() => {
    fetchEducationDetails();
  }, [fetchEducationDetails]);

  /* -------------------- ACTIONS -------------------- */
  const addEducation = () => {
    setEducations(prev => {
      const nextIndex = prev.length;
      setActiveAccordionKey(String(nextIndex));

      return [
        ...prev,
        {
          uiId: crypto.randomUUID(),
          educationId: null,
          label: "Select Education Level",
          data: null,
          parsedId: crypto.randomUUID()
        }
      ];
    });
    setIsDirty(true);
  };

  const deleteEducation = (parsedId) => {
    setEducations(prev => prev.filter(e => e.parsedId !== parsedId));
    if (parsedId) dispatch(removeParsedEducationById(parsedId));
    setIsDirty(true);
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

  /* -------------------- VALIDATION -------------------- */
  const saveAndNext = () => {
    if (!educations.length) {
      toast.error("Please add at least 1 education");
      return;
    }

    for (let i = 0; i < educations.length; i++) {
      const ref = getRef(String(i));
      if (ref?.current?.validate) {
        const result = ref.current.validate();
        if (!result.isValid) {
          setActiveAccordionKey(String(i));
          toast.error("Please fill required fields");
          return;
        }
      }
    }

    goNext();
  };

  return {
    educations,
    masterData,
    loading,
    isDirty,
    activeAccordionKey,
    setActiveAccordionKey,
    getRef,
    addEducation,
    deleteEducation,
    refreshEducation: fetchEducationDetails,
    getExistingRanges,
    saveAndNext,
    setIsDirty
  };
};
