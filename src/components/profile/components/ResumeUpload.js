// components/Tabs/ResumeUpload.jsx
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '../../../css/Resumeupload.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faUpload } from "@fortawesome/free-solid-svg-icons";
import deleteIcon from '../../../assets/delete-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import profileApi from '../services/profile.api';
import { setParsedResume } from '../store/resumeSlice';
import { setParsedExperience } from '../store/experienceSlice';
import { MAX_FILE_SIZE_BYTES } from '../../../shared/utils/validation';
import { toast } from 'react-toastify';
import greenCheck from '../../../assets/green-check.png'

const ResumeUpload = ({ resumeFile, setResumeFile, setParsedData, setResumePublicUrl, goNext, goBack, resumePublicUrl, isBasicDetailsSubmitted }) => {
  const [fileName, setFileName] = useState(resumeFile ? resumeFile.name : '');
  const [loading, setLoading] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user?.data);
  const auth = useSelector((state) => state.user.authUser);
  const token = user?.accessToken;
  const candidateId = user?.user?.id;
  // const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
  const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
  useEffect(() => {
    // If Basic Details was NOT submitted, resume must NOT exist
    if (!isBasicDetailsSubmitted) {
      setResumeFile(null);
      setResumePublicUrl("");
      setFileName("");
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
        setLocalBlobUrl(null);
      }
    }
  }, [isBasicDetailsSubmitted]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("Invalid file type. Only PDF, DOC, DOCX files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File size exceeds 2MB. Please upload a smaller resume.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setFileName(file.name);
    
    // Create a blob URL for local preview
    const blobUrl = URL.createObjectURL(file);
    setLocalBlobUrl(blobUrl);
  };

  const fileSizeInKB = resumeFile ? (resumeFile.size / 1024).toFixed(2) : null;

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('resume-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleContinue = async () => {
    // accept existing OR new resume
    if (!resumeFile && !resumePublicUrl) {
      alert("Please upload a resume");
      return;
    }
    if (!candidateId) {
      alert("Candidate ID missing");
      return;
    }
    // If resume already exists and user didn’t change it
    if (!resumeFile && resumePublicUrl) {
      goNext();
      return;
    }
    // Otherwise upload new resume
    setLoading(true);
    try {
      const res = await profileApi.parseResumeDetails(candidateId, resumeFile);
      if (res?.publicUrl) {
        setResumePublicUrl(res.publicUrl);
      }
      if (res?.data) {
        setParsedData(res.data);
        try {
          const parsed = res.data;
          // Attach stable temporary ids to parsed education entries
          const makeId = () => (
            (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`
          );
          const parsedWithIds = {
            ...parsed,
            education: Array.isArray(parsed.education)
              ? parsed.education.map(e => ({ ...e, __tempId: e.__tempId || makeId() }))
              : []
          };
          dispatch(setParsedResume(parsedWithIds));

          // Handle experience data
          if (Array.isArray(parsed.experience) && parsed.experience.length > 0) {
            // Attach stable temporary ids to parsed experience entries
            const experienceWithIds = parsed.experience.map(exp => ({
              ...exp,
              __tempId: exp.__tempId || makeId()
            }));
            
            // Dispatch experience to Redux store
            dispatch(setParsedExperience(experienceWithIds));

            // Transform experience data for API call
            const experiencePayload = experienceWithIds.map(exp => ({
              candidateId: candidateId,
              fromDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : null,
              toDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : null,
              organizationName: exp.employer || '',
              role: exp.designation || '',
              postHeld: exp.designation || '',
              isPresentlyWorking: exp.endDate ? false : true, // Check if currently working
              workDescription: '',
              monthsOfExp: exp.totalYears ? calculateMonthsFromString(exp.totalYears) : 0,
              currentCtc: 0,
              workExperienceId: null
            }));

            // Call API to save all experience details
            try {
              await profileApi.saveAllExperienceDetails(candidateId, experiencePayload);
              toast.success("Experience details saved successfully");
            } catch (expErr) {
              console.error("Failed to save experience details", expErr);
              toast.error("Failed to save experience details");
              // Don't block the flow, continue anyway
            }
          }
        } catch (e) {
          console.warn('Failed to dispatch parsed resume/experience', e);
        }
      }
      goNext(); // ✅ success only
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Resume upload failed"
      );
    } finally {
      setLoading(false);
    }

  };

  // Helper function to convert totalYears string to months
  const calculateMonthsFromString = (totalYearsStr) => {
    if (!totalYearsStr) return 0;
    let months = 0;
    const yearMatch = totalYearsStr.match(/(\d+)\s*year/i);
    const monthMatch = totalYearsStr.match(/(\d+)\s*month/i);
    
    if (yearMatch) {
      months += parseInt(yearMatch[1], 10) * 12;
    }
    if (monthMatch) {
      months += parseInt(monthMatch[1], 10);
    }
    return months;
  };

  useEffect(() => {
    if (!candidateId) return;
    const fetchResume = async () => {
      try {
        const res = await profileApi.getResumeDetails(candidateId);
        const resumeData = res.data; // IMPORTANT
        if (resumeData?.fileUrl) {
          setResumePublicUrl(resumeData.fileUrl);
          setFileName(resumeData.fileName);
          setResumeFile(null); // DO NOT fake File object
        }
      } catch (err) {
        console.error("Resume fetch failed", err);
      }
    };
    fetchResume();
  }, [candidateId]);

  const handleDelete = () => {
    setResumeFile(null);
    setResumePublicUrl("");
    setFileName("");
    // Clean up blob URL
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setLocalBlobUrl(null);
    }
    // clear file input value (critical)
    const input = document.getElementById("resume-input");
    if (input) {
      input.value = "";
    }
  };

  return (
    <div className="form-content-section px-4 py-3 border rounded bg-white w-50 mx-auto">
      <p className="tab_headers" style={{ marginBottom: '0px', marginTop: '0rem' }}>Resume Upload</p>

      {/* If resume already uploaded → show file preview UI */}
      {(resumeFile || resumePublicUrl) ? (
        <div className="uploaded-file-box p-3 mt-3 d-flex justify-content-between align-items-center"
          style={{
            border: "2px solid #bfc8e2",
            borderRadius: "8px",
            background: "#f7f9fc"
          }}
        >

          {/* Left: Check icon + file info */}
          <div className="d-flex align-items-center">
            <img
              src={greenCheck}
              style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
            />

            <div className='p-2'>
              <div style={{ fontWeight: 600 }}>
                {fileName}
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {resumeFile ? `${fileSizeInKB} KB` : "Click eye icon to view"}
              </div>
            </div>
          </div>

          {/* Right: Action icons */}
          <div className="d-flex gap-2">

            <div onClick={() => window.open(localBlobUrl || resumePublicUrl, "_blank")}>
              <img src={viewIcon} alt='View' style={{ width: '25px', cursor: 'pointer' }} />
            </div>

            {/* <div>
          <img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} />
        </div> */}

            <div>
              <img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} onClick={handleDelete} />
            </div>
          </div>
        </div>

      ) : (
        /* Dropzone UI when NO resume uploaded */
        <div className="dropzone" onClick={handleBrowseClick}>
          <div className="d-flex flex-column align-items-center" style={{ lineHeight: "2rem" }}>
            <FontAwesomeIcon icon={faUpload} className="text-secondary mb-2" size="2x" />

            <div>Drag & drop your resume here, or</div>
            <span style={{ color: "#42579f", cursor: "pointer" }}>Click to Upload</span>
            <span className="text-muted mt-2" style={{ fontSize: "12px" }}>
              Supported: PDF, DOC, DOCX (Max 2MB)
            </span>
          </div>

          <input
            type="file"
            id="resume-input"
            accept=".pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Next button */}
      <div className="mt-4 d-flex justify-content-between">
        <div>
          <button type="button" className="btn btn-outline-secondary text-muted" onClick={goBack}>Back</button>
        </div>
        <div>
          <button
            className="btn btn-primary"
            style={{
              backgroundColor: "#ff7043",
              border: "none",
              padding: "0.6rem 2rem",
              borderRadius: "4px",
              color: "#fff",
              fontSize: '0.875rem'
            }}
            onClick={handleContinue}
            disabled={!resumeFile && !resumePublicUrl}
          >
            {loading ? "Processing..." : "Save & Next"}
            <FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
          </button>
        </div>
      </div>

      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 9999
          }}
        >
          <div className="text-center text-white">
            <div className="spinner-border text-light mb-3" role="status" />
            <div style={{ fontSize: "16px", fontWeight: 500 }}>
              Parsing resume, please wait...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeUpload;
