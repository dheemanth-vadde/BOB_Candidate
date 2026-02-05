import { useEffect, useRef, useState } from 'react';
import UploadField from '../../../shared/components/UploadField';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { markProfileCompleted } from '../../../components/auth/store/userSlice';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import bulbIcon from '../../../assets/bulb-icon.png';
import Loader from '../../../shared/components/Loader';

const DocumentDetails = ({ goBack, setActiveTab }) => {
	const dispatch = useDispatch();
	const [isFresher, setIsFresher] = useState(false);
	const [formErrors, setFormErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;

	const photoDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PHOTO") || null
	);
	const signDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "SIGN") || null
	);
	const idProofDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "IDPROOF") || null
	);
	const birthDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "BIRTH_CERT") || null
	);
	const payslipDoc1 = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PAYSLIP1") || null
	);
	const payslipDoc2 = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PAYSLIP2") || null
	);
	const payslipDoc3 = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "PAYSLIP3") || null
	);
	const othersDoc = useSelector((state) =>
		state.documentTypes?.list?.find(doc => doc.docCode === "OTHERS") || null
	);

	const uploadFieldsConfig = [
		{ key: "photo", label: "Photo", required: true, docCode: photoDoc?.docCode, documentId: photoDoc?.documentTypeId },
		{ key: "signature", label: "Signature", required: true, docCode: signDoc?.docCode, documentId: signDoc?.documentTypeId },
		{ key: "idProof", label: "ID Proof", required: true, docCode: idProofDoc?.docCode, documentId: idProofDoc?.documentTypeId },
		{ key: "birthCert", label: "Birth Certificate", required: true, docCode: birthDoc?.docCode, documentId: birthDoc?.documentTypeId },
		{ key: "salary1", label: "Last 3 Month Salary Slip - Month 1", required: true, docCode: payslipDoc1?.docCode, documentId: payslipDoc1?.documentTypeId },
		{ key: "salary2", label: "Last 3 Month Salary Slip - Month 2", required: true, docCode: payslipDoc2?.docCode, documentId: payslipDoc2?.documentTypeId },
		{ key: "salary3", label: "Last 3 Month Salary Slip - Month 3", required: true, docCode: payslipDoc3?.docCode, documentId: payslipDoc3?.documentTypeId },
		{ key: "other", label: "Others - Name", required: false, customName: true, docCode: othersDoc?.docCode, documentId: othersDoc?.documentTypeId }
	];

	const [files, setFiles] = useState({});
	const [customNames, setCustomNames] = useState({});
	const fileInputRefs = useRef({});

	const payslipDocCodes = [
		payslipDoc1?.docCode,
		payslipDoc2?.docCode,
		payslipDoc3?.docCode
	].filter(Boolean);

	/* ================= FRESHER STATUS (BACKEND ONLY) ================= */
	useEffect(() => {
		const fetchFresherStatus = async () => {
			if (!candidateId) return;

			try {
				const res = await profileApi.getWorkStatus();
				let fresherStatus = false;
				console.log(res)
				if (
					res?.data === true ||
					res?.data === "true" ||
					res?.data === 1 ||
					res?.data === "1"
				) {
					fresherStatus = true;
				} else if (typeof res?.data === "object" && res.data !== null) {
					if (typeof res.data.isFresher !== "undefined") {
						fresherStatus = Boolean(res.data.isFresher);
					} else if (typeof res.data !== "undefined") {
						fresherStatus = Boolean(res.data);
					}
				}
				setIsFresher(fresherStatus);
			} catch (err) {
				console.error("Failed to fetch work status", err);
				setIsFresher(false);
			}
		};
		fetchFresherStatus();
	}, [candidateId]);

	/* ========== CLEAR PAYSLIPS WHEN FRESHER = TRUE ========== */
	useEffect(() => {
		if (!isFresher) return;

		setFiles(prev => {
			const updated = { ...prev };
			delete updated.salary1;
			delete updated.salary2;
			delete updated.salary3;
			return updated;
		});

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.salary1;
			delete updated.salary2;
			delete updated.salary3;
			return updated;
		});
	}, [isFresher]);

	/* ================= FETCH EXISTING DOCUMENTS ================= */
	const fetchDocuments = async () => {
		if (!candidateId) return;

		try {
			setLoading(true);
			const res = await profileApi.getDocumentDetails();
			const docs = (res?.data || []).filter(d => d.documentId !== null);
			const populatedFiles = {};

			for (const field of uploadFieldsConfig) {
				if (!field.documentId) continue;

				const matchedDocs = docs.filter(d => d.documentId === field.documentId);
				if (!matchedDocs.length) continue;

				const latest = matchedDocs.sort(
					(a, b) => new Date(b.createdDate) - new Date(a.createdDate)
				)[0];

				populatedFiles[field.key] = {
					name: latest.displayName ?? latest.fileName,
					fileName: latest.fileName,
					displayName: latest.displayName,
					url: latest.fileUrl,
					documentTypeId: latest.documentId,
					isFromApi: true
				};
			}

			setFiles(populatedFiles);
		} catch (err) {
			console.error("Failed to fetch documents", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const allDocIdsReady = uploadFieldsConfig.every(
			f => !f.required || f.documentId
		);
		if (!candidateId || !allDocIdsReady) return;
		fetchDocuments();
	}, [
		candidateId,
		photoDoc?.documentTypeId,
		signDoc?.documentTypeId,
		idProofDoc?.documentTypeId,
		payslipDoc1?.documentTypeId,
		payslipDoc2?.documentTypeId,
		payslipDoc3?.documentTypeId
	]);

	const handleBrowse = (key) => {
		fileInputRefs.current[key].click();
	};

	const uploadDocument = async (field, file) => {
		if (!candidateId || !field.documentId) return;

		try {
			const skipValidation =
				["PHOTO", "SIGN", "OTHERS", "IDPROOF"].includes(field.docCode) ||
				field.customName === true;

			if (!skipValidation) {
				try {
					const validationRes = await profileApi.ValidateDocument(field.docCode, file);
					if (!validationRes?.success) {
						toast.error("Invalid Certificate");
						return false;
					}
				} catch {
					toast.error("Invalid Certificate");
					return false;
				}
			}

			const isOther = field.docCode === "OTHERS";

			const sanitizedDocumentName = isOther
			? customNames[field.key]?.trim().replace(/\s+/g, "_")
			: undefined;

			setLoading(true);

			await profileApi.postDocumentDetails(
				// candidateId,
				field.documentId,
				file,
				isOther,
				sanitizedDocumentName
			);

			return true;
		} catch (err) {
			console.error(`Upload failed for ${field.label}`, err);
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = async (key, e) => {
		const file = e.target.files[0];
		if (!file) return;

		const allowedMimeTypes = ["image/png", "image/jpeg"];
		const allowedExtensions = [".png", ".jpg", ".jpeg"];
		const maxSize = 2 * 1024 * 1024; // 2MB

		const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

		// ❌ Extension check
		if (!allowedExtensions.includes(extension)) {
			toast.error("Only JPG, JPEG, and PNG files are allowed");
			e.target.value = ""; // IMPORTANT
			return;
		}

		// ❌ MIME type check
		if (!allowedMimeTypes.includes(file.type)) {
			toast.error("Invalid file type");
			e.target.value = "";
			return;
		}

		// ❌ Size check
		if (file.size > maxSize) {
			toast.error("File size must not exceed 2MB");
			e.target.value = "";
			return;
		}

		const field = uploadFieldsConfig.find(f => f.key === key);
		if (!field) return;

		setFormErrors(prev => ({ ...prev, [key]: '' }));

		const uploadSucceeded = await uploadDocument(field, file);
		if (uploadSucceeded) {
			// Refresh from API to get updated file info
			await fetchDocuments();
		} else {
			e.target.value = ""; // reset on failure
		}
	};

	const handleCustomName = (key, value) => {
		setCustomNames(prev => ({ ...prev, [key]: value }));
	};

	const validateForm = () => {
		const errors = {};

		uploadFieldsConfig.forEach(field => {
			const isPayslip = payslipDocCodes.includes(field.docCode);

			if (field.required && !files[field.key]) {
				if (isPayslip && isFresher) return;
				errors[field.key] = "This field is required";
			}
		});

		setFormErrors(errors);
		return errors;
	};

	const handleSubmit = async () => {
		const errors = validateForm();
		if (Object.keys(errors).length > 0) return;

		try {
			await profileApi.saveProfileComplete(true);
			dispatch(markProfileCompleted());
			setActiveTab("jobs");
		} catch (err) {
			toast.error("Profile completion failed");
		}
	};

	return (
		<div className="px-4 py-3 border rounded bg-white">
			<div className='d-flex'>
				<img src={bulbIcon} style={{ width: '25px', height: '25px', marginTop: '6px', marginRight: '5px' }}/>
				<p className='orange_text mt-2'>Please ensure all uploaded documents are clear and eligible. File size should not exceed 2MB per document.</p>
			</div>
			<div className="row g-5 mt-0">
				{uploadFieldsConfig.map(field => {
					const isPayslip = payslipDocCodes.includes(field.docCode);
					const disabled = isPayslip && isFresher;

					return (
						<div key={field.key} className="col-md-6 col-sm-12 mt-2">
							<div id={`upload-${field.key}`}>
								<UploadField
									label={field.label}
									required={field.required && !(isPayslip && isFresher)}
									file={files[field.key]}
									customName={field.customName}
									customNameValue={customNames[field.key]}
									onCustomNameChange={(v) => handleCustomName(field.key, v)}
									onBrowse={!disabled ? () => handleBrowse(field.key) : undefined}
									onChange={!disabled ? (e) => handleFileChange(field.key, e) : undefined}
									onDelete={() => fetchDocuments()}
									ref={(el) => (fileInputRefs.current[field.key] = el)}
									isInvalid={!!formErrors[field.key]}
									disabled={disabled}
								/>
								{formErrors[field.key] && (
									<div className="text-danger" style={{ fontSize: "0.875rem" }}>
										{formErrors[field.key]}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<div className="d-flex justify-content-between mt-4">
				<button className="btn grey_border" onClick={goBack} style={{ fontSize: '0.875rem', padding: "0.6rem 1rem" }}>
					<FontAwesomeIcon icon={faChevronLeft} size='sm' style={{ marginRight: '0.25rem' }} />
					Back
				</button>

				<button
					className="btn btn-primary"
					style={{ backgroundColor: "#ff7043", border: "none", color: 'white', padding: "0.6rem 1rem", fontSize: '0.875rem' }}
					onClick={handleSubmit}
				>
					Submit
				</button>
			</div>

			{loading && (
				<Loader />
			)}
		</div>
	);
};

export default DocumentDetails;
