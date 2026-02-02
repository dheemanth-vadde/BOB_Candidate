// hooks/useRelevantJobs.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import jobsApiService from "../services/jobsApiService";
import masterApi from "../../../services/master.api";
import { savePreference } from "../store/preferenceSlice";
import { mapJobsApiToList } from "../../jobs/mappers/jobMapper";
import { mapRequisitionsApiToList } from "../../jobs/mappers/requisitionMapper";
import { mapMasterDataApi } from "../../jobs/mappers/masterDataMapper";
import { mapCandidateToPreview } from "../../jobs/mappers/candidatePreviewMapper";
import { mapInterviewCentresApi } from "../../jobs/mappers/interviewCentreMapper";
import { extractValidationErrors } from "../../../shared/utils/validationError";
import useDebounce from "../../jobs/hooks/useDebounce";

export const useRelevantJobs = ({ requisitionId, positionId, setActiveTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.data?.user?.id;

  /* -------------------- STATE -------------------- */
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [previewData, setPreviewData] = useState();

  const [departments, setDepartments] = useState([]);
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [masterData, setMasterData] = useState([{}]);
  const [isMasterReady, setIsMasterReady] = useState(false);

  const [requisitions, setRequisitions] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
	
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreCheckModal, setShowPreCheckModal] = useState(false);
  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
	const [showApplyModal, setShowApplyModal] = useState(false);

  const [validationErrors, setValidationErrors] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [turnstileToken, setTurnstileToken] = useState("");

  const [infoDocs, setInfoDocs] = useState([]);
  const [activeInfoType, setActiveInfoType] = useState("");

  const [interviewCentres, setInterviewCentres] = useState([]);

  const [selectedPositionId, setSelectedPositionId] = useState(positionId || "");

  const [applyForm, setApplyForm] = useState({
    state1: "",
    location1: "",
    state2: "",
    location2: "",
    state3: "",
    location3: "",
    ctc: "",
    examCenter: "",
  });

  /* -------------------- CONSTANTS -------------------- */
  const experienceOptions = [
    { label: "1-2 years", min: 1, max: 2 },
    { label: "3-4 years", min: 3, max: 4 },
    { label: "5-6 years", min: 5, max: 6 },
    { label: "7-8 years", min: 7, max: 8 },
    { label: "9-10 years", min: 9, max: 10 },
    { label: "11+ years", min: 11, max: Infinity },
  ];

  /* -------------------- HELPERS -------------------- */
  const getExperienceRangeInMonths = () => {
    if (!selectedExperience.length) {
      return { monthMinExp: null, monthMaxExp: null };
    }
    const min = Math.min(...selectedExperience.map(e => e.min));
    const hasInfinity = selectedExperience.some(e => e.max === Infinity);
    const max = hasInfinity ? null : Math.max(...selectedExperience.map(e => e.max));
    return {
      monthMinExp: min * 12,
      monthMaxExp: max === null ? 0 : max * 12,
    };
  };

  const isApplicationOpen = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return today <= end;
  };

  /* -------------------- FETCHERS -------------------- */
  const fetchRequisitions = async () => {
    try {
      const res = await jobsApiService.getActiveRequisitions();
      setRequisitions(mapRequisitionsApiToList(res?.data || []));
    } catch {
      toast.error("No active requisitions found");
    }
  };

  const fetchInterviewCentres = async () => {
    try {
      const res = await jobsApiService.getInterviewCentres();
      setInterviewCentres(mapInterviewCentresApi(res));
    } catch {
      toast.error("Failed to load interview centres");
    }
  };

  const fetchJobs = async () => {
    if (!candidateId || !isMasterReady) return;

    try {
      setLoading(true);
      const { monthMinExp, monthMaxExp } = getExperienceRangeInMonths();

      const payload = {
        candidateId,
        searchText: requisitionId ? "" : debouncedSearchTerm || "",
        deptIds: selectedDepartments,
        stateIds: selectedStates,
        requisitionId: selectedRequisition || null,
        page: currentPage,
        size: pageSize,
        monthMinExp,
        monthMaxExp,
      };

      const res = await jobsApiService.getJobPositions(payload);
      let jobsData = res?.data?.content || [];

      if (selectedPositionId) {
        jobsData = jobsData.filter(
          j => j.positionsDTO?.positionId === selectedPositionId
        );
      }

      setJobs(mapJobsApiToList(jobsData, masterData));
      setTotalPages(selectedPositionId ? 1 : res?.data?.totalPages ?? 0);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    (async () => {
      const masterRes = await jobsApiService.getMasterData();
      const mapped = mapMasterDataApi(masterRes);
      setDepartments(mapped.departments || []);
      setStates(mapped.states || []);
      setLocations(mapped.cities || []);
      setMasterData(mapped);
      setIsMasterReady(true);
    })();
  }, []);

  useEffect(fetchRequisitions, []);
  useEffect(fetchInterviewCentres, []);

  useEffect(() => setCurrentPage(0), [pageSize]);
  useEffect(() => setCurrentPage(0), [
    debouncedSearchTerm,
    selectedDepartments,
    selectedStates,
    selectedExperience,
    selectedRequisition,
  ]);

  useEffect(fetchJobs, [
    isMasterReady,
    currentPage,
    debouncedSearchTerm,
    selectedDepartments,
    selectedStates,
    selectedExperience,
    selectedRequisition,
    pageSize,
  ]);

  /* -------------------- ACTIONS -------------------- */
  const handleConfirmApply = async () => {
    const payload = {
      candidateId,
      positionId: selectedJob.position_id,
      expectedCtc: Number(applyForm.ctc) || 0,
      interviewCenter: applyForm.examCenter || "",
    };
    const res = await jobsApiService.applyToJob(payload);
    if (res?.success) {
      toast.success("Job applied successfully");
      setShowPaymentModal(false);
      setActiveTab("applied-jobs");
    }
  };

  return {
    /* state */
    jobs,
    loading,
    departments,
    states,
    locations,
    requisitions,
    selectedJob,
    previewData,
    experienceOptions,
    navigate,
		activeInfoType,
		infoDocs,
		selectedExperience,
		
    /* ui flags */
    showModal,
    showPreviewModal,
    showPaymentModal,
    showPreCheckModal,
    showValidationErrorModal,
    showInfoModal,

    /* pagination */
    currentPage,
    pageSize,
    totalPages,

    /* setters */
    setShowModal,
    setShowPreviewModal,
    setShowPaymentModal,
    setShowPreCheckModal,
    setShowValidationErrorModal,
    setShowInfoModal,
    setSelectedJob,
    setSearchTerm,
    setSelectedRequisition,
    setSelectedDepartments,
    setSelectedStates,
    setSelectedExperience,
    setPageSize,
    setCurrentPage,
    setApplyForm,
    setTurnstileToken,
    setSelectedPositionId,
		setShowApplyModal,

    /* helpers */
    isApplicationOpen,
    handleConfirmApply,
  };
};
