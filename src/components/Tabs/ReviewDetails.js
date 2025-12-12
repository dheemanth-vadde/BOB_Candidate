import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiService } from '../../services/apiService';
import { faTrash, faEye, faUpload, faPlus, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from 'react-toastify';
import '../../css/ReviewDetails.css';
import Tesseract from 'tesseract.js';
import { useDispatch, useSelector } from "react-redux";
import {
  setDigiLockerConnected,
  setDigiLockerAccessToken
} from "../../store/digilockerSlice";
import { store } from '../../store';

// Confirmation Modal Component
const ConfirmationModal = ({ show, onConfirm, onCancel, message }) => {
  if (!show) return null;

  return (
    <div className="modal" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1050
    }}>
      <div className="modal-dialog mddialog" style={{
        margin: '1.75rem auto',
        width: 'auto',
        maxWidth: '500px',
        transform: 'none',
        transition: 'transform .3s ease-out',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        pointerEvents: 'auto',
        backgroundColor: '#fff',
        backgroundClip: 'padding-box',
        border: '1px solid rgba(0,0,0,.2)',
        borderRadius: '0.3rem',
        outline: 0
      }}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title md-title">Confirm Deletion</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body mdbody">
            <p>{message || 'Are you sure you want to delete this document?'}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger danbtn" onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewDetails = ({ initialData = {}, onSubmit, resumePublicUrl, goNext }) => {
  const [formData, setFormData] = useState(initialData);
  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;
  const [selectedIdProof, setSelectedIdProof] = useState('');
  const [idProofFile, setIdProofFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [masterData, setMasterData] = useState({
    countries: [],
    specialCategories: [],
    reservationCategories: []
  });
  const [dobError, setDobError] = useState("");
  const [documentError, setDocumentError] = useState("");
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
  const [aadharDob, setAadharDob] = useState(""); // extracted DOB from Aadhaar
  const [casteList, setCasteList] = useState([]);
  const [selectedCaste, setSelectedCaste] = useState("");
  const [specialList, setSpecialList] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [additionalDocs, setAdditionalDocs] = useState([
    { docId: "", docName: "", freeText: "", fileName: "", file: null, url: "", uploading: false, required: true }
  ]);
  // State for confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDobValidated, setIsDobValidated] = useState(initialData.is_dob_validated || false);
  const [digiLockerDocs, setDigiLockerDocs] = useState([]);

  const dispatch = useDispatch();

  // Helper: refresh server's document list and document types and normalize shape
  const refreshDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docsRes = candidateId ? await apiService.getCandidateDocuments(candidateId) : { data: [] };
      const typesRes = await apiService.getAllDocuments();

      const types = typesRes?.data || [];
      setDocumentTypes(types);

      const docs = (docsRes?.data || []).map(doc => {
        const rawName = doc.file_name || '';
        const file_name = rawName && rawName.includes('_') ? rawName.split('_').slice(1).join('_') : rawName;
        return {
          ...doc,
          document_type: types.find(t => t.document_id === doc.document_id)?.document_name || doc.document_type || 'Unknown',
          file_name,
          file_url: doc.file_url || doc.url || ''
        };
      });

      setExistingDocuments(docs);
    } catch (err) {
      console.error('refreshDocuments error', err);
      toast.error('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  // DigiLocker start flow
  const startDigiLockerFlow = async () => {
    try {
      toast.info("Verifying via DigiLocker…");

      // Call backend
      const res = await apiService.exchangeDigiLockerToken("ca82123a5476aa2f5e4638957c0ecc55c6ec07c1");

      // Extract access token safely
      const accessToken =
        res?.access_token ||
        res?.data?.access_token ||
        (typeof res === "string" ? res : null);

      if (!accessToken) {
        toast.error("No DigiLocker access token received.");
        return;
      }

      // Store token only
      dispatch(setDigiLockerAccessToken(accessToken));
      dispatch(setDigiLockerConnected(true));

      toast.success("DigiLocker Verified Successfully!");

      // Load issued docs / eaadhaar
      await loadDigiLockerData();

    } catch (err) {
      console.error(err);
      toast.error("DigiLocker Token API Failed");
    }
  };

  // Load DigiLocker items
  const loadDigiLockerData = async () => {
    try {
      const token = store.getState().digilocker.accessToken;

      if (!token) {
        toast.error("Missing DigiLocker token");
        return;
      }

      // 1. Fetch Issued Docs
      const issued = await apiService.getDigiLockerIssuedDocs(token);
      console.log("Issued Docs:", issued);
      setDigiLockerDocs(issued.items || []);

      // 2. Fetch eAadhaar
      const aadhaar = await apiService.getEAadhaar(token);
      console.log("eAadhaar:", aadhaar);

      toast.success("DigiLocker documents loaded successfully!");

    } catch (err) {
      console.error(err);
      toast.error("Failed to load DigiLocker documents");
    }
  };

  const getMappedDocumentId = (docType) => {
    if (!docType) return null;

    const map = {
      "ADHAR": 3,
      "PANCR": 4,
      "SSCER": 5
      // add more if needed
    };

    return map[docType] || null;
  };

  const deleteDigiLockerDoc = (uri) => {
    setDigiLockerDocs(prev => prev.filter(doc => doc.uri !== uri));
    toast.success("Document removed");
  };

  // Handle DigiLocker -> backend save & then add to existingDocuments
  const handleDigiLockerDirectUpload = async (doc) => {
    try {
      const token = store.getState().digilocker.accessToken;
      const candidateId = store.getState().user.user?.candidate_id;
      const backendDocId = getMappedDocumentId(doc.doctype);

      setDigiLockerDocs(prev =>
        prev.map(d => d.uri === doc.uri ? { ...d, uploading: true } : d)
      );

      const res = await apiService.getDigiLockerFile(
        token,
        doc.uri,
        candidateId,
        backendDocId
      );

      const returned = res?.data || res || {};
      const fileUrl = returned.file_url || returned.url || null;
      const returnedId = returned.document_store_id || returned.id || returned.document_id || null;

      setDigiLockerDocs(prev =>
        prev.map(d =>
          d.uri === doc.uri
            ? { ...d, uploaded: true, uploading: false, file_url: fileUrl }
            : d
        )
      );

      // Add to existingDocuments normalized
      if (returnedId || fileUrl) {
        const savedDoc = {
          document_store_id: returnedId || Math.random().toString(36).slice(2),
          document_id: returned.document_id || backendDocId,
          document_type: doc.name || documentTypes.find(t => t.document_id == backendDocId)?.document_name || 'DigiLocker Doc',
          file_name: doc.name || returned.file_name || 'DigiLocker-file',
          file_url: fileUrl || ''
        };
        setExistingDocuments(prev => [...prev, savedDoc]);
      } else {
        // fallback refresh
        await refreshDocuments();
      }

      toast.success(`${doc.name} uploaded successfully!`);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      setDigiLockerDocs(prev =>
        prev.map(d =>
          d.uri === doc.uri ? { ...d, uploading: false } : d
        )
      );

      toast.error("Failed to upload DigiLocker document");
    }
  };

  const viewDigiLockerDocument = (doc) => {
    console.log(doc)
    if (!doc.uploaded) {
      toast.error("Please upload the DigiLocker document first.");
      return;
    }
    window.open(doc.file_url, "_blank");
  };

  useEffect(() => {
    apiService.getAllCategories()
      .then((res) => {
        setCasteList(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });

    apiService.getAllSpecialCategories()
      .then((res) => setSpecialList(res.data || []))
      .catch((err) => console.error("Failed to fetch special categories:", err));
  }, []);

  // fetch document types + existing documents via helper
  useEffect(() => {
    refreshDocuments();
  }, [candidateId]);

  useEffect(() => {
    const checkIfUserReturned = () => {
      const connected = localStorage.getItem("digilocker_verified");

      if (connected === "yes") {
        loadDigiLockerData();
        localStorage.removeItem("digilocker_verified");
      }
    };

    checkIfUserReturned();
  }, []);

  const handleAdditionalDocChange = (index, field, value) => {
    const updated = [...additionalDocs];
    updated[index][field] = value;

    // If document type is selected, update docName from documentTypes
    if (field === 'docId') {
      const selectedDoc = documentTypes.find(doc => doc.document_id == value);
      if (selectedDoc) {
        updated[index].docName = selectedDoc.document_name;
      }
    }

    setAdditionalDocs(updated);
  };

  // Upload and push normalized result into existingDocuments (or refresh as fallback)
  const handleAdditionalDocFile = async (index, file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, or PNG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    // Clear any previous document error when user attempts to upload a new file
    setDocumentError('');
    setDobError('');

    const updated = [...additionalDocs];
    updated[index] = {
      ...updated[index],
      file: file,
      fileName: file.name,
      uploading: true,
      url: '' // Clear any previous URL
    };
    setAdditionalDocs(updated);

    try {
      // Aadhaar Validation
      if (updated[index].docName === "Aadhar Card") {
        // 1️⃣ OCR DOB extraction
        const extractedDob = await extractDOBFromAadhar(file);
        if (extractedDob) {
          setAadharDob(extractedDob); // Store the extracted DOB

          const formDob = formData.dob
            ? new Date(formData.dob).toISOString().split("T")[0]
            : null;

          if (formDob && formDob !== extractedDob) {
            const formattedAadharDob = extractedDob.split("-").reverse().join("/");
            setDobError(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);
            toast.error(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);

            // Keep the document but mark it as having a DOB mismatch
            updated[index] = {
              ...updated[index],
              hasDobMismatch: true,
              uploading: false
            };
            setAdditionalDocs(updated);
            return; // Stop upload if mismatch
          } else if (!formDob) {
            // If user hasn't filled DOB, auto-fill from Aadhaar
            setFormData(prev => ({ ...prev, dob: extractedDob }));
          }
        } else {
          setDobError("Could not extract DOB from Aadhaar. Please upload a clear file.");
          updated[index].uploading = false;
          setAdditionalDocs([...updated]);
          return;
        }
      }

      // Upload Document (if Aadhaar validation passed or not Aadhaar)
      const doc = updated[index];
      let othersValue = "";

      if (doc.docName === "Others" && doc.freeText) {
        othersValue = doc.freeText;
      }

      const fd = new FormData();
      fd.append("file", file);

      const addRes = await apiService.addCandidateDocument(candidateId, doc.docId, othersValue, fd);
      console.log('addCandidateDocument response:', addRes);

      const returned = addRes?.data || addRes || {};
      const serverFileUrl = returned.file_url || returned.url || returned.file_url || null;
      const returnedId = returned.document_store_id || returned.id || returned.document_store_id || returned.document_id || null;

      updated[index].uploading = false;
      updated[index].uploaded = true;
      updated[index].fileName = file.name;
      updated[index].url = serverFileUrl || URL.createObjectURL(file);
      setAdditionalDocs([...updated]);

      // If server returned info, append normalized doc to existingDocuments
      if (returnedId || serverFileUrl) {
        const savedDoc = {
          document_store_id: returnedId || Math.random().toString(36).slice(2),
          document_id: returned.document_id || doc.docId,
          document_type: documentTypes.find(t => t.document_id == (returned.document_id || doc.docId))?.document_name || updated[index].docName || 'Unknown',
          file_name: returned.file_name || updated[index].fileName,
          file_url: serverFileUrl || updated[index].url
        };

        setExistingDocuments(prev => [...prev, savedDoc]);
      } else {
        // fallback: refresh server list
        await refreshDocuments();
      }

      toast.success(`${updated[index].docName || 'Document'} uploaded successfully!`);
    } catch (err) {
      console.error("Upload failed:", err);
      updated[index].uploading = false;
      setAdditionalDocs([...updated]);
      toast.error("Failed to upload document");
    }
  };

  useEffect(() => {
    console.log('initialData', initialData)
    setFormData(initialData);
    setSelectedIdProof(initialData.id_proof || '');
    setDocumentUrl(initialData.document_url || '');
    if (initialData.is_dob_validated) {
      setIsDobValidated(true);
    }
  }, [initialData]);

  // Extract DOB from existing Aadhaar (if present in server docs)
useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await apiService.getMasterData();
        console.log("Master data:", response);
        setMasterData({
          countries: response.countries || [],
          specialCategories: response.special_categories || [],
          reservationCategories: response.reservation_categories || []
        });
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };
    fetchMasterData();
  }, []);  useEffect(() => {
    const fetchExistingAadharDob = async () => {
      const aadharDoc = existingDocuments.find(doc => doc.document_type === 'Aadhar Card');
      if (aadharDoc && !aadharDob) {
        try {
          const extracted = await extractDOBFromAadhar(aadharDoc.file_url);
          if (extracted) setAadharDob(extracted);
        } catch (err) {
          console.error('Failed to extract DOB from existing Aadhaar:', err);
        }
      }
    };
    fetchExistingAadharDob();
  }, [existingDocuments]);

  // Revalidate Aadhar DOB when formData.dob changes or when component mounts
  useEffect(() => {
    if (aadharDob && formData.dob) {
      const formDob = new Date(formData.dob).toISOString().split('T')[0];
      if (formDob === aadharDob) {
        setDobError("");
        setIsDobValidated(true);
        // Clear the DOB mismatch flag from any Aadhaar documents
        setAdditionalDocs(prev =>
          prev.map(doc => ({
            ...doc,
            hasDobMismatch: doc.docName === 'Aadhar Card' ? false : doc.hasDobMismatch
          }))
        );
      } else if (dobError && dobError.includes("Aadhaar shows")) {
        const formattedAadharDob = aadharDob.split('-').reverse().join('/');
        setDobError(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);
        setIsDobValidated(false);
      }
    }
  }, [formData.dob, aadharDob, dobError]);

  // Update formData when isDobValidated changes to ensure it's included in the submission
  useEffect(() => {
    if (isDobValidated) {
      setFormData(prev => ({
        ...prev,
        is_dob_validated: true
      }));
    }
  }, [isDobValidated]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setHasAttemptedUpload(true);
    setDobError('');
    setDocumentError('');

    // --- DOB mismatch check ---
    if (aadharDob && formData.dob) {
      const formDob = new Date(formData.dob).toISOString().split('T')[0];
      if (formDob !== aadharDob) {
        const formattedAadharDob = aadharDob.split('-').reverse().join('/');
        setDobError(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);
        toast.error(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);
        return;
      }
    }

    // Filter out any empty document entries
    const validAdditionalDocs = additionalDocs.filter(doc => doc.docId && (doc.url || doc.file));

    // Check for any Aadhaar documents with DOB mismatch
    const hasDobMismatch = validAdditionalDocs.some(doc =>
      doc.docName === 'Aadhar Card' && doc.hasDobMismatch
    );

    if (hasDobMismatch) {
      setDobError("Please correct the DOB to match your Aadhaar card.");
      return;
    }

    // Centralized validation for Aadhar/PAN
    const hasAadharDoc = existingDocuments.some(doc => doc.document_type === 'Aadhar Card') ||
      validAdditionalDocs.some(doc => doc.docName === 'Aadhar Card');
    const hasPanDoc = existingDocuments.some(doc => doc.document_type === 'Pan Card') ||
      validAdditionalDocs.some(doc => doc.docName === 'Pan Card');

    // if (!hasAadharDoc && !hasPanDoc) {
    //   setDocumentError("Please upload either an Aadhaar Card or a PAN Card (mandatory).");
    //   toast.error("Please upload either Aadhaar or PAN card.");
    //   return;
    // }

    // Perform DOB validation if an Aadhaar card is present.
    if (hasAadharDoc) {
      const aadharDoc = additionalDocs.find(doc => doc.docName === 'Aadhar Card' && doc.file);
      if (aadharDoc) {
        try {
          let extractedDob = null;

          if (aadharDob) {
            extractedDob = aadharDob;
          } else if (aadharDoc.file_url) {
            extractedDob = await extractDOBFromAadhar(aadharDoc.file_url);
            if (extractedDob) {
              setAadharDob(extractedDob);
            }
          }

          const formDob = formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : null;
          if (extractedDob) {
            if (formDob && formDob !== extractedDob) {
              const formattedAadharDob = extractedDob.split('-').reverse().join('/');
              setDobError(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);
              toast.error(`DOB mismatch! Aadhaar shows: ${formattedAadharDob}`);
              return;
            } else if (!formDob) {
              const formattedAadharDob = extractedDob.split('-').reverse().join('/');
              setDobError(`Aadhaar DOB: ${formattedAadharDob}. Please update your DOB to match.`);
              toast.info(`Aadhaar DOB found. Please ensure your form DOB matches.`);
              return;
            }
          } else if (aadharDoc.file_url) {
            setDobError("Could not verify DOB from Aadhaar. Please ensure it's a valid Aadhaar document.");
            toast.error("Invalid Aadhaar document. Could not extract DOB.");
            return;
          }
        } catch (error) {
          console.error("Error validating Aadhaar:", error);
          setDobError("An error occurred while validating Aadhaar. Please try again.");
          toast.error("Failed to validate Aadhaar. Please try again.");
          return;
        }
      }
    }

    // If all validations pass, proceed with the submission
    try {
      const candidatePayload = {
        candidate_id: candidateId,
        file_url: resumePublicUrl,
        document_url: documentUrl,
        full_name: formData.name || '',
        email: formData.email || '',
        gender: formData.gender || 'Male',
        id_proof: formData.id_proof || '',
        phone: formData.phone || '',
        date_of_birth: formData.dob || '',
        skills: formData.skills || '',
        total_experience: formData.totalExperience || 0,
        current_designation: formData.currentDesignation || '',
        current_employer: formData.currentEmployer || '',
        address: formData.address || '',
        nationality_id: formData.nationality_id || '',
        education_qualification: formData.education_qualification || '',
        is_dob_validated: isDobValidated,
        extra_documents: additionalDocs.map(d => ({
          type_id: d.docId,
          type: d.docName,
          url: d.url
        })),
        candidate_other_details: {},
        reservation_category_id: formData.reservation_category_id || '',
        special_category_id: formData.special_category_id || '',
      };

      await apiService.updateCandidates(candidatePayload);

      toast.success('Candidate data updated successfully!');

      // Upload any additional docs that are not already uploaded to server
      for (const doc of additionalDocs.filter(d => d.docId && (d.file || d.url))) {
        const isBlob = doc.url && doc.url.startsWith && doc.url.startsWith('blob:');
        const alreadySaved = doc.uploaded || (doc.url && !isBlob);
        if (alreadySaved) continue;

        const fd = new FormData();
        fd.append('file', doc.file);
        fd.append('file_name', doc.fileName);
        const others = doc.freeText || '';
        const res = await apiService.addCandidateDocument(candidateId, doc.docId, others, fd);

        // normalize and append to existingDocuments if returned
        const returned = res?.data || res || {};
        const serverFileUrl = returned.file_url || returned.url || null;
        const returnedId = returned.document_store_id || returned.id || returned.document_store_id || returned.document_id || null;

        if (returnedId || serverFileUrl) {
          const savedDoc = {
            document_store_id: returnedId || Math.random().toString(36).slice(2),
            document_id: returned.document_id || doc.docId,
            document_type: documentTypes.find(t => t.document_id == (returned.document_id || doc.docId))?.document_name || doc.docName || 'Unknown',
            file_name: returned.file_name || doc.fileName,
            file_url: serverFileUrl || doc.url
          };
          setExistingDocuments(prev => [...prev, savedDoc]);
        } else {
          // fallback: refresh server list after each upload
          await refreshDocuments();
        }
      }

      toast.success("All additional documents saved successfully!");
      setIsDobValidated(true);

      // refresh to ensure server state is current before navigation
      await refreshDocuments();

      onSubmit(formData);
      goNext();
    } catch (error) {
      console.error('Error submitting candidate data:', error);
      toast.error('Failed to submit candidate data: ' + (error.message || ''));
    }
  };

  const handleInvalid = (e) => {
    e.target.setCustomValidity("This is mandatory");
  };

  const handleInput = (e) => {
    e.target.setCustomValidity("");
  };

  const handleIdProofChange = (e) => {
    const value = e.target.value;
    setSelectedIdProof(value);
    setFormData(prev => ({ ...prev, id_proof: value }));
    setIdProofFile(null);
  };

  const extractDOBFromAadhar = async (file) => {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => console.log(m),
      });

      // Look for DOB in various formats
      let extractedDob = "";

      // 1. Look near "DOB" text
      const dobLine = text.split("\n").find(line => line.toUpperCase().includes("DOB"));
      if (dobLine) {
        const match = dobLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (match) extractedDob = match[1];
      }

      // 2. Look for any date in the format DD/MM/YYYY or DD-MM-YYYY
      if (!extractedDob) {
        const match = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (match) extractedDob = match[1];
      }

      // 3. Look for just the year
      if (!extractedDob) {
        const match = text.match(/\b(19|20)\d{2}\b/);
        if (match) extractedDob = match[0];
      }

      if (!extractedDob) return null;

      // Normalize to YYYY-MM-DD format
      if (extractedDob.includes("/") || extractedDob.includes("-")) {
        const [d, m, y] = extractedDob.split(/[-/]/);
        return `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      return null;
    } catch (error) {
      console.error('Error extracting DOB from Aadhaar:', error);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setDobError("");
    setIdProofFile(file);

    try {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setDobError('Please upload a valid file (PDF, JPG, or PNG)');
        setIdProofFile(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setDobError('File size should be less than 5MB');
        setIdProofFile(null);
        return;
      }

      if (selectedIdProof === 'Aadhar') {
        const extractedDOB = await extractDOBFromAadhar(file);
        if (extractedDOB) {
          setAadharDob(extractedDOB);
          if (formData.dob) {
            const formDob = new Date(formData.dob).toISOString().split('T')[0];
            if (extractedDOB !== formDob) {
              setDobError(`DOB mismatch! Aadhaar shows: ${extractedDOB.split('-').reverse().join('/')}`);
              return;
            }
          } else {
            setFormData(prev => ({ ...prev, dob: extractedDOB }));
          }
        } else {
          setDobError('Could not extract DOB from Aadhaar. Please ensure it is clearly visible.');
          return;
        }
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      setDobError('Error processing file: ' + (error.message || 'Please try again'));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async () => {
    if (!docToDelete) return;

    // If it's a temporary document (not yet saved to server)
    if ((docToDelete.id || '').toString().startsWith('temp-')) {
      if (docToDelete.onConfirm) {
        docToDelete.onConfirm();
      }
      setShowDeleteModal(false);
      setDocToDelete(null);
      return;
    }

    try {
      await apiService.deleteCandidateDocument(docToDelete.id);
      setExistingDocuments(prev =>
        prev.filter(d => d.document_store_id !== docToDelete.id)
      );
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error("Failed to delete document");
    } finally {
      setShowDeleteModal(false);
      setDocToDelete(null);
    }
  };

  if (!formData) {
    return <p>Loading details...</p>;
  }

  return (
    <div className="form-content-section text-start p-4">
      <form className="row g-4 formfields" onSubmit={handleSubmit} onInvalid={handleInvalid} onInput={handleInput}>
        {/* Basic fields omitted for brevity in this fragment — keep your existing fields */}
        <div className="col-md-3">
          <label htmlFor="name" className="form-label">Name <span className="text-danger">*</span></label>
          <input type="text" className="form-control" id="name" value={formData.name || ''} onChange={handleChange} required />
        </div>
<div className="col-md-3">
          <label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
          <input
            type="date"
            className={`form-control ${dobError ? 'is-invalid' : ''}`}
            id="dob"
            value={formData.dob || ''}
            onChange={(e) => {
              handleChange(e);
              if (dobError) setDobError("");
            }}
            required
            disabled={isDobValidated}  // <-- disable if DOB validated
          />
          {dobError && (
            <div className="text-danger mt-1 erordob">
              {dobError}
            </div>
          )}
        </div>

        <div className="col-md-3">
          <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={user?.email || formData.email || ''}
            onChange={handleChange}
            disabled
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
          <select
            className="form-select"
            id="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="col-md-3">
          <label htmlFor="phone" className="form-label">Phone <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            id="phone"
            value={formData.phone || formData.Mobile || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="education_qualification" className="form-label">Education Qualification <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            id="education_qualification"
            value={formData.education_qualification || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="totalExperience" className="form-label">Total Experience</label>
          <input
            type="text"
            className="form-control"
            id="totalExperience"
            value={formData.totalExperience}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="currentDesignation" className="form-label">Current Designation</label>
          <input
            type="text"
            className="form-control"
            id="currentDesignation"
            value={formData.currentDesignation}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="currentEmployer" className="form-label">Current Employer</label>
          <input
            type="text"
            className="form-control"
            id="currentEmployer"
            value={formData.currentEmployer}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="skills" className="form-label">Skills</label>
          <textarea
            className="form-control"
            id="skills"
            rows="3"
            value={formData.skills}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea
            className="form-control"
            id="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3 nationality">
          <label htmlFor="nationality_id" className="form-label">Nationality <span className="text-danger">*</span></label>
          <select
            className="form-select"
            id="nationality_id"
            value={formData.nationality_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Nationality</option>
            {masterData.countries.map(country => (
              <option key={country.country_id} value={country.country_id}>
                {country.country_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Caste Dropdown */}
        <div className="col-md-3">
          <label htmlFor="reservation_category_id" className="form-label">Caste</label>
          <select
            className="form-select"
            id="reservation_category_id"
            value={formData.reservation_category_id || ''}
            onChange={handleChange}
          >
            <option value="">Select Caste</option>

            {casteList.map((item) => (
              <option key={item.reservation_categories_id} value={item.reservation_categories_id}>
                {item.category_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="special_category_id" className="form-label">Special Category</label>
          <select
            className="form-select"
            id="special_category_id"
            value={formData.special_category_id || ''}
            onChange={handleChange}
          >
            <option value="">Select Special Category</option>
            {specialList.map((item) => (
              <option key={item.special_category_id} value={item.special_category_id}>
                {item.special_category_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 mt-4 adddoc">
          <div className='d-flex mb-2 gap-2'>
            <h5> Documents <span className="text-danger">*</span></h5>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={startDigiLockerFlow}
              style={{ fontSize: "12px" }}
            >
              Upload from DigiLocker
            </button>
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Document Type</th>
                <th style={{ width: "40%" }}>Document Name</th>
                <th style={{ width: "30%" }}>Upload File</th>
              </tr>
            </thead>
            <tbody>
              {/* Render saved documents from server first */}
              {existingDocuments.map((doc, index) => (
                <tr key={`existing-${index}`}>
                  <td>{doc.document_type || 'N/A'}</td>
                  <td>{doc.file_name || 'Document'}</td>
                  <td className="d-flex align-items-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm viewdoc iconhover"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </a>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger dangbtn iconhover"
                      onClick={() => {
                        if (!doc.document_store_id) {
                          return toast.error("Cannot delete unsaved document");
                        }
                        setDocToDelete({
                          id: doc.document_store_id,
                          name: doc.file_name || 'this document'
                        });
                        setShowDeleteModal(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>

                    {/* Re-upload control */}
                    <>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        id={`reupload-${doc.document_store_id}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const fd = new FormData();
                            fd.append("file", file);

                            const res = await apiService.addCandidateDocument(
                              candidateId,
                              doc.document_id,      // existing document type
                              "",                    // others if needed
                              fd
                            );

                            const returned = res?.data || res || {};
                            const serverFileUrl = returned.file_url || returned.url || null;

                            setExistingDocuments(prev =>
                              prev.map(d =>
                                d.document_store_id === doc.document_store_id
                                  ? { ...d, file_name: file.name, file_url: serverFileUrl || URL.createObjectURL(file) }
                                  : d
                              )
                            );

                            toast.success("Document re-uploaded successfully!");
                          } catch (err) {
                            console.error("Re-upload failed:", err);
                            toast.error("Failed to re-upload document");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary printn iconhover"
                        onClick={() =>
                          document.getElementById(`reupload-${doc.document_store_id}`).click()
                        }
                      >
                        <FontAwesomeIcon icon={faUpload} className="me-1" />
                      </button>
                    </>
                  </td>
                </tr>
              ))}

              {/* DigiLocker docs (if any) */}
              {digiLockerDocs.length > 0 && digiLockerDocs.map((doc, index) => (
                <tr key={`digi-${index}`}>
                  <td>{doc.name}</td>
                  <td>{doc.issuer}</td>
                  <td className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm viewdoc iconhover"
                      onClick={() => viewDigiLockerDocument(doc)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm viewdoc iconhover"
                      onClick={() => deleteDigiLockerDoc(doc.uri)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>

                    {!doc.uploaded ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm viewdoc iconhover"
                          onClick={() => handleDigiLockerDirectUpload(doc)}
                        >
                          <FontAwesomeIcon icon={faUpload} />
                        </button>

                        {doc.uploading && (
                          <div className="spinner-border spinner-border-sm"></div>
                        )}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          style={{ color: "#22bb33", marginLeft: "6px" }}
                        />
                        Uploaded
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* Additional documents being added */}
              {additionalDocs.map((doc, index) => (
                <tr key={index}>
                  <td>
                    <select
                      className="form-select"
                      value={doc.docId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selected = documentTypes.find(dt => String(dt.document_id) === selectedId);
                        handleAdditionalDocChange(index, "docId", selectedId);
                        handleAdditionalDocChange(index, "docName", selected ? selected.document_name : "");
                      }}
                    >
                      <option value="">Select Document</option>
                      {documentTypes
                        .filter((dt) => {
                          // Always allow "Others"
                          if (dt.document_name === "Others") return true;

                          // Get IDs already selected in the UI (excluding this row)
                          const selectedIds = additionalDocs
                            .filter((_, i) => i !== index)
                            .map(d => String(d.docId));

                          // Get IDs already present in API response (existing documents)
                          const existingIds = existingDocuments.map(d => String(d.docId || d.document_id));

                          // Hide if selected in another row OR already saved in DB
                          return !selectedIds.includes(String(dt.document_id)) &&
                            !existingIds.includes(String(dt.document_id));
                        })
                        .map((dt) => (
                          <option key={dt.document_id} value={dt.document_id}>
                            {dt.document_name}
                          </option>
                        ))
                      }
                    </select>

                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter document name"
                      value={doc.freeText || ""}
                      disabled={doc.docName !== "Others"}   // Disable unless "Others" is selected
                      onChange={(e) => handleAdditionalDocChange(index, "freeText", e.target.value)}
                    />

                  </td>
                  <td className="d-flex align-items-center justify-content-end gap-2">
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleAdditionalDocFile(index, e.target.files?.[0])}
                      disabled={!doc.docId || doc.uploading}
                    />
                    {doc.uploading && (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                    )}

                    {index === additionalDocs.length - 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm printn iconhover"
                        onClick={() =>
                          setAdditionalDocs([
                            ...additionalDocs,
                            { docId: "", docName: "", freeText: "", fileName: "", file: null, url: "", uploading: false }
                          ])
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {documentError && (
            <div className="text-danger mt-2">
              {documentError}
            </div>
          )}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary" style={{
            backgroundColor: 'rgb(255, 112, 67)',
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Submit
          </button>
        </div>

      </form>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onConfirm={handleDeleteDocument}
        onCancel={() => {
          setShowDeleteModal(false);
          setDocToDelete(null);
        }}
        message={docToDelete ? `Are you sure you want to delete ${docToDelete.name}?` : 'Are you sure you want to delete this document?'}
      />
    </div>
  );
};

export default ReviewDetails;
