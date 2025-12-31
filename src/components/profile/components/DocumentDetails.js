import React, { useEffect, useRef, useState } from 'react'
import UploadField from '../../../shared/components/UploadField';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { toast } from 'react-toastify';

const DocumentDetails = ({ goNext, goBack, setActiveTab }) => {
	const [isFresher, setIsFresher] = useState(false);
	const [formErrors, setFormErrors] = useState({});
	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;
	const photoDoc = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "PHOTO"
		) || null
	);
	const signDoc = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "SIGN"
		) || null
	);
	const idProofDoc = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "IDPROOF"
		) || null
	);
	const payslipDoc1 = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "PAYSLIP1"
		) || null
	);
	const payslipDoc2 = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "PAYSLIP2"
		) || null
	);
	const payslipDoc3 = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "PAYSLIP3"
		) || null
	);
	const othersDoc = useSelector((state) =>
		state.documentTypes?.list?.data?.find(
			(doc) => doc.docCode === "Others"
		) || null
	);

	console.log(photoDoc, payslipDoc2)
	const uploadFieldsConfig = [
		{ key: "photo", label: "Photo", required: true, docCode: photoDoc?.docCode, documentId: photoDoc?.documentTypeId },
		{ key: "signature", label: "Signature", required: true, docCode: signDoc?.docCode, documentId: signDoc?.documentTypeId },
		{ key: "idProof", label: "ID Proof", required: true, docCode: idProofDoc?.docCode, documentId: idProofDoc?.documentTypeId },
		{ key: "salary1", label: "Last 3 Month Salary Slip - Month 1", required: true, docCode: payslipDoc1?.docCode, documentId: payslipDoc1?.documentTypeId },
		{ key: "salary2", label: "Last 3 Month Salary Slip - Month 2", required: true, docCode: payslipDoc2?.docCode, documentId: payslipDoc2?.documentTypeId },
		{ key: "salary3", label: "Last 3 Month Salary Slip - Month 3", required: true, docCode: payslipDoc3?.docCode, documentId: payslipDoc3?.documentTypeId },


		{ key: "other", label: "Others - Name", required: false, customName: true },
		{ key: "other", label: "Others - Name", required: false, customName: true, docCode: othersDoc?.docCode, documentId: othersDoc?.documentTypeId }
	];
	const [files, setFiles] = useState({});
	const [customNames, setCustomNames] = useState({});
	const fileInputRefs = useRef({});
	const payslipDocCodes = [payslipDoc1?.docCode, payslipDoc2?.docCode, payslipDoc3?.docCode].filter(Boolean);
	useEffect(() => {
		const fetchWorkStatus = async () => {
			if (!candidateId) return;
			try {
				const res = await profileApi.getWorkStatus(candidateId);
				const fresherStatus = Boolean(res?.data?.data);
				setIsFresher(fresherStatus);
			} catch (err) {
				console.error("Failed to fetch work status", err);
			}
		};
		fetchWorkStatus();
	}, [candidateId]);

	const fetchDocuments = async () => {
		if (!candidateId) return;

		try {
			const res = await profileApi.getDocumentDetails(candidateId);

			const docs = (res?.data?.data || []).filter(
				d => d.documentId !== null
			);

			const populatedFiles = {};

			for (const field of uploadFieldsConfig) {
				if (!field.documentId) continue;

				const matchedDocs = docs.filter(
					d => d.documentId === field.documentId
				);

				if (!matchedDocs.length) continue;

				const latest = matchedDocs.sort(
					(a, b) => new Date(b.createdDate) - new Date(a.createdDate)
				)[0];

				populatedFiles[field.key] = {
					name: latest.fileName,
					url: latest.fileUrl,
					documentTypeId: latest.documentId,
					isFromApi: true
				};
			}

			setFiles(populatedFiles);
		} catch (err) {
			console.error("Failed to fetch documents", err);
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
		if (!candidateId) {
			console.error("Candidate ID missing");
			return;
		}
		if (!field.documentId) {
			console.error(`Missing documentId for ${field.key}`);
			return;
		}
		try {
			await profileApi.postDocumentDetails(
				candidateId,
				field.documentId,
				file,
				field.docCode === "Others",
				customNames[field.key]
			);
			console.log(`${field.label} uploaded successfully`);
		} catch (err) {
			console.error(`Upload failed for ${field.label}`, err);
		}
	};

	const handleFileChange = async (key, e) => {
		const file = e.target.files[0];
		if (!file) return;
		const field = uploadFieldsConfig.find(f => f.key === key);
		if (!field) {
			console.error(`No field config found for key: ${key}`);
			return;
		}
		// Clear error for this field
		setFormErrors(prev => ({
			...prev,
			[key]: ''
		}));
		// Save locally first (UI update)
		setFiles((prev) => ({ ...prev, [key]: file }));
		// Upload immediately
		await uploadDocument(field, file);
	};

	const handleCustomName = (key, value) => {
		setCustomNames((prev) => ({ ...prev, [key]: value }));
	};

	const validateForm = () => {
		const errors = {};
		let isValid = true;

		uploadFieldsConfig.forEach(field => {
			// If payslip fields and candidate is fresher → skip required validation
			const isPayslip = payslipDocCodes.includes(field.docCode);
			if (field.required && !files[field.key]) {
				if (isPayslip && isFresher) {
					// skip validation for payslip fields when fresher
					return;
				}
				errors[field.key] = 'This field is required';
				isValid = false;
			}
		});

		setFormErrors(errors);
		return isValid;
	};

	const handleSubmit = () => {
		if (!validateForm()) {
			// Scroll to the first error
			const firstErrorKey = Object.keys(formErrors)[0];
			if (firstErrorKey) {
				const element = document.getElementById(`upload-${firstErrorKey}`);
				element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}
		setActiveTab('jobs');
		goNext();
	};

	return (
		<div className="px-4 py-3 border rounded bg-white">
			<div className="row g-5 mt-0">
				{uploadFieldsConfig.map((field) => {
					// Compute disabled state: disable payslip uploads for freshers
					const isPayslip = payslipDocCodes.includes(field.docCode);
					const disabled = isPayslip && isFresher;
					return (
						<div key={field.key + (field.docCode || '')} className="col-md-6 col-sm-12">
							<div id={`upload-${field.key}`}>
								<UploadField
									label={field.label}
									required={field.required && !(isPayslip && isFresher)}
									file={files[field.key]}
									customName={field.customName}
									customNameValue={customNames[field.key]}
									onCustomNameChange={(value) => handleCustomName(field.key, value)}
									onBrowse={!disabled ? () => handleBrowse(field.key) : undefined}
									onChange={!disabled ? (e) => handleFileChange(field.key, e) : undefined}
									ref={(el) => (fileInputRefs.current[field.key] = el)}
									onDeleted={() => {
										fetchDocuments();
										setFormErrors(prev => ({
											...prev,
											[field.key]: field.required ? 'This field is required' : ''
										}));
									}}
									isInvalid={!!formErrors[field.key]}
									disabled={disabled}
								/>
								{formErrors[field.key] && (
									<div className="text-danger" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
										{formErrors[field.key]}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
			<div className="d-flex justify-content-between mt-4">
				<div >
					<button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>

				</div>
				<div>

					<button
						type="button"
						className="btn btn-primary"
						style={{
							backgroundColor: "#ff7043",
							border: "none",
							padding: "8px 24px",
							borderRadius: "4px",
							color: "#fff"
						}}
						onClick={handleSubmit}
					>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
}

export default DocumentDetails