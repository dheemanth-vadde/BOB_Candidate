import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import profileApi from "../services/profile.api";
import { toast } from "react-toastify";
import {
  mapExperienceApiToUi,
  mapExperienceDetailsFormToApi
} from "../mappers/ExperienceMapper";
import { validateEndDateAfterStart } from "../../../shared/utils/validation";

/* -------------------- CONSTANTS -------------------- */
const EMPTY_FORM = {
  organization: "",
  role: "",
  postHeld: "",
  from: "",
  to: "",
  working: false,
  description: "",
  experience: 0,
  currentCTC: ""
};

/* -------------------- HELPERS -------------------- */
const calculateExperienceDays = (fromDate, toDate) => {
  if (!fromDate) return 0;
  const start = new Date(fromDate);
  const end = toDate ? new Date(toDate) : new Date();
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

const trimStrings = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v
    ])
  );

/* -------------------- HOOK -------------------- */
export const useExperienceDetails = ({ goNext }) => {
  const user = useSelector(state => state?.user?.user?.data);
  const candidateId = user?.user?.id;

  const fileInputRef = useRef(null);

  const [experienceList, setExperienceList] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [certificateFile, setCertificateFile] = useState(null);
  const [existingDocument, setExistingDocument] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [isFresher, setIsFresher] = useState(false);
  const [showFresherOption, setShowFresherOption] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  /* -------------------- DERIVED -------------------- */
  const totalExperienceMonths = useMemo(() => {
    const totalDays = experienceList.reduce(
      (sum, item) => sum + (item.experience || 0),
      0
    );
    return Math.floor(totalDays / 30);
  }, [experienceList]);

  /* -------------------- FETCH -------------------- */
  const fetchExperienceDetails = useCallback(async () => {
    if (!candidateId) return;

    try {
      setLoading(true);
      const res = await profileApi.getExperienceDetails();
      const apiList = Array.isArray(res?.data) ? res.data : [];
      const mapped = apiList.map(mapExperienceApiToUi);

      setExperienceList(mapped);
      setIsDirty(false);

      if (mapped.length > 0) {
        setShowFresherOption(false);
        setIsFresher(false);
      } else {
        setShowFresherOption(true);
      }
    } catch {
      setShowFresherOption(true);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchExperienceDetails();
  }, [fetchExperienceDetails]);

  useEffect(() => {
    if (formData.working) {
      setFormData(prev => ({ ...prev, to: "" }));
    }
  }, [formData.working]);

  /* -------------------- HANDLERS -------------------- */
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setFormErrors(p => ({ ...p, [id]: "" }));
    setIsDirty(true);
  };

  const handleCTCChange = (e) => {
    setFormData(prev => ({ ...prev, currentCTC: e.target.value }));
    setFormErrors(p => ({ ...p, currentCTC: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCertificateFile(file);
    setExistingDocument(null);
    setFormErrors(p => ({ ...p, certificate: "" }));
    setIsDirty(true);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setCertificateFile(null);
    setExistingDocument(null);
    setFormErrors({});
    setIsEditMode(false);
    setEditingRow(null);
  };

  /* -------------------- VALIDATION -------------------- */
  const validateForm = () => {
    const errors = {};

    if (!formData.organization.trim()) errors.organization = "Required";
    if (!formData.role.trim()) errors.role = "Required";
    if (!formData.postHeld.trim()) errors.postHeld = "Required";
    if (!formData.from) errors.from = "Required";

    if (!formData.working && !formData.to)
      errors.to = "Required";

    if (!formData.working && formData.from && formData.to) {
      const { isValid, error } = validateEndDateAfterStart(
        formData.from,
        formData.to
      );
      if (!isValid) errors.to = error;
    }

    if (!formData.description.trim()) errors.description = "Required";
    if (!formData.currentCTC || Number(formData.currentCTC) <= 0)
      errors.currentCTC = "Required";

    if (formData.working === false && !certificateFile && !existingDocument)
      errors.certificate = "Required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* -------------------- SAVE -------------------- */
  const saveExperience = async () => {
    if (!validateForm()) return;

    const effectiveTo = formData.working
      ? new Date().toISOString().split("T")[0]
      : formData.to;

    const experienceDays = calculateExperienceDays(
      formData.from,
      effectiveTo
    );

    const sanitized = trimStrings(formData);

    const payloadBase = mapExperienceDetailsFormToApi(
      {
        ...sanitized,
        to: sanitized.working ? null : sanitized.to,
        experience: experienceDays
      },
      candidateId
    );

    const payload = isEditMode
      ? { ...payloadBase, workExperienceId: editingRow.workExperienceId }
      : payloadBase;

    try {
      setLoading(true);
      await profileApi.postExperienceDetails(
        // candidateId,
        payload,
        certificateFile
      );

      toast.success(isEditMode ? "Updated successfully" : "Saved successfully");
      setIsDirty(false);
      resetForm();
      fetchExperienceDetails();
    } catch {
      toast.error("Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditingRow(item);
    setFormData({
      organization: item.organization,
      role: item.role,
      postHeld: item.postHeld,
      from: item.from,
      to: item.to,
      working: item.working === "Yes" || item.working === true,
      description: item.description,
      experience: item.experience,
      currentCTC: String(item.currentCTC || "")
    });
    setExistingDocument(item.certificate || null);
    setCertificateFile(null);
  };

  const handleDelete = async (item) => {
    try {
      setLoading(true);
      await profileApi.deleteExperienceDetails(item.workExperienceId);
      toast.success("Deleted successfully");
      fetchExperienceDetails();
      if (editingRow?.workExperienceId === item.workExperienceId) {
        resetForm();
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const saveAndNext = async () => {
    if (isFresher) {
      await profileApi.postWorkStatus(true);
      goNext();
      return;
    }

    if (!experienceList.length) {
      toast.error("Please add at least one experience or mark fresher");
      return;
    }

    await profileApi.postWorkStatus(false);
    goNext();
  };

  const handleWorkingChange = (value) => {
    const isWorking = value === "true";

    setFormData(prev => ({
      ...prev,
      working: isWorking,
      to: isWorking ? "" : prev.to
    }));

    if (isWorking) {
      setFormErrors(prev => {
        const { certificate, to, ...rest } = prev;
        return rest;
      });
    }

    setIsDirty(true);
  };

	const blockCTCKeys = (e) => {
		const blocked = ["e", "E", "+", "-", ","];
		if (blocked.includes(e.key)) {
			e.preventDefault();
		}
	};

	const clearExistingDocument = () => {
		setExistingDocument(null);
		setCertificateFile(null);
		setIsDirty(true);
	};

	const formatFileSize = (size) => {
		if (!size) return "";
		const kb = size / 1024;
		if (kb < 1024) return `${kb.toFixed(1)} KB`;
		return `${(kb / 1024).toFixed(1)} MB`;
	};

  return {
    experienceList,
    formData,
    formErrors,
    certificateFile,
    existingDocument,
    isEditMode,
    isFresher,
    showFresherOption,
    totalExperienceMonths,
    isDirty,
    loading,
    fileInputRef,

    setIsFresher,

    handleChange,
    handleCTCChange,
    handleFileChange,
    handleBrowse,
    saveExperience,
    handleEdit,
    handleDelete,
    handleCancelEdit,
    saveAndNext,
		blockCTCKeys,
		handleWorkingChange,
		clearExistingDocument,
		formatFileSize
  };
};
