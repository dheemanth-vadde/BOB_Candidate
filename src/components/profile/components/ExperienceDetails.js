import { faChevronRight, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react'
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import profileApi from '../services/profile.api';
import { useSelector } from 'react-redux';
import { mapExperienceApiToUi, mapExperienceDetailsFormToApi } from '../mappers/ExperienceMapper';
import { toast } from 'react-toastify';
import { validateEndDateAfterStart, validateNonEmptyText } from '../../../shared/utils/validation';
import BackButtonWithConfirmation from '../../../shared/components/BackButtonWithConfirmation';
import { Form } from 'react-bootstrap';
import bulbIcon from '../../../assets/bulb-icon.png';
import Loader from './Loader';
import greenCheck from '../../../assets/green-check.png'
import { handleEyeClick } from "../../../shared/utils/fileDownload";
const ExperienceDetails = ({ goNext, goBack }) => {
	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;
	const email = user?.user?.email
	const createdBy = user?.user?.id;
	const [formErrors, setFormErrors] = useState({});
	// const email = "sumanthsangam2@gmail.com"
	// const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	// const createdBy = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	const [experienceList, setExperienceList] = useState([]);
	const [certificateFile, setCertificateFile] = useState(null);
	const [existingDocument, setExistingDocument] = useState(null);
	const [totalExperienceMonths, setTotalExperienceMonths] = useState(0);
	const [isFresher, setIsFresher] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editingRow, setEditingRow] = useState(null);
	const [showFresherOption, setShowFresherOption] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		organization: "",
		role: "",
		postHeld: "",
		from: "",
		to: "",
		working: false,
		description: "",
		experience: 0,
		currentCTC: ""
	});


	useEffect(() => {
		let totalDays = experienceList.reduce((sum, item) => sum + (item.experience || 0), 0);
		let months = Math.floor(totalDays / 30);
		setTotalExperienceMonths(months);
	}, [experienceList]);

	useEffect(() => {
		if (formData.working === true) {
			setFormData(prev => ({
				...prev,
				to: ""
			}));
		}
	}, [formData.working]);

	// useEffect(() => {
	// 	if (!formData.working || !formData.from) return;
	// 	const interval = setInterval(() => {
	// 		setFormData(prev => ({
	// 			...prev,
	// 			experience: calculateExperienceDays(prev.from, null)
	// 		}));
	// 	}, 24 * 60 * 60 * 1000); // every day
	// 	return () => clearInterval(interval);
	// }, [formData.working, formData.from]);

	useEffect(() => {
		const fetchWorkStatus = async () => {
			try {
				const res = await profileApi.getWorkStatus(candidateId);
				const fresherStatus = Boolean(res?.data);
				setIsFresher(fresherStatus);
			} catch (err) {
				console.error("Failed to fetch work status", err);
			}
		};
		if (candidateId) {
			fetchWorkStatus();
		}
	}, [candidateId]);

	useEffect(() => {
		if (!isFresher) return;

		// 1. Reset form completely
		setFormData({
			organization: "",
			role: "",
			postHeld: "",
			from: "",
			to: "",
			working: false,
			description: "",
			experience: 0,
			currentCTC: ""
		});

		// 2. Clear files
		setCertificateFile(null);
		setExistingDocument(null);

		// 3. Clear errors
		setFormErrors({});

		// 4. Exit edit mode
		setIsEditMode(false);
		setEditingRow(null);

		// 5. Mark dirty (this IS a meaningful change)
		setIsDirty(true);
	}, [isFresher]);

	const trimStrings = (obj) =>
		Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
			key,
			typeof value === "string" ? value.trim() : value
			])
		);

	const calculateExperienceDays = (fromDate, toDate) => {
		if (!fromDate) return 0;
		const start = new Date(fromDate);
		const end = toDate ? new Date(toDate) : new Date(); // 🔑 TODAY if working
		const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
		return diff > 0 ? diff : 0;
	};

	const handleChange = (e) => {
		const { id, value } = e.target;

		setFormData(prev => ({
			...prev,
			[id]: value
		}));
		setIsDirty(true);

		if (formErrors[id]) {
			setFormErrors(prev => ({
				...prev,
				[id]: ""
			}));
		}
	};


	const fetchExperienceDetails = async () => {
		try {
			setLoading(true);
			const res = await profileApi.getExperienceDetails(candidateId);
			const apiList = Array.isArray(res?.data)
				? res?.data
				: [];
			const mappedList = apiList.map(mapExperienceApiToUi);
			setExperienceList(mappedList);
			setIsDirty(false);
			// 🔑 CORE LOGIC
			if (mappedList.length > 0) {
				setShowFresherOption(false);
				setIsFresher(false); // force consistency
			} else {
				setShowFresherOption(true);
			}
		} catch (err) {
			console.error("Failed to fetch experience details", err);
			setShowFresherOption(true); // safe fallback
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExperienceDetails();
	}, [candidateId]);

	const validateForm = () => {
		const errors = {};

		if (!formData.organization.trim()) {
			errors.organization = "This field is required";
		}

		if (!formData.role.trim()) {
			errors.role = "This field is required";
		}

		if (!formData.postHeld.trim()) {
			errors.postHeld = "This field is required";
		}

		if (!formData.from) {
			errors.from = "This field is required";
		}

		if (!formData.working && !formData.to) {
			errors.to = "This field is required";
		}

		if (!formData.working && formData.from && formData.to) {
			const { isValid, error } = validateEndDateAfterStart(
				formData.from,
				formData.to
			);
			if (!isValid) {
				errors.to = error;
			}
		}

		if (!formData.description.trim()) {
			errors.description = "This field is required";
		}

		if (!formData.currentCTC.trim() || isNaN(Number(formData.currentCTC)) || Number(formData.currentCTC) <= 0) {
			errors.currentCTC = "This field is required";
		}

		if (!certificateFile && !existingDocument) {
			errors.certificate = "This field is required";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validateExperienceRow = (row) => {
		const errors = {};

		if (!row.organization?.trim()) errors.organization = "Organization is required";
		if (!row.role?.trim()) errors.role = "Role is required";
		if (!row.postHeld?.trim()) errors.postHeld = "Post Held is required";
		if (!row.from) errors.from = "From date is required";

		if (!row.working && !row.to) {
			errors.to = "To date is required";
		}

		if (!row.description?.trim()) errors.description = "Description is required";

		if (!row.currentCTC || Number(row.currentCTC) <= 0) {
			errors.currentCTC = "Current CTC is required";
		}

		if (!row.certificate) {
			errors.certificate = "Experience certificate is required";
		}

		return errors;
	};

	const handleSaveExperience = async () => {
		if (!validateForm()) return;

		const effectiveToDate = formData.working
			? new Date().toISOString().split("T")[0]
			: formData.to;

		const experienceDays = calculateExperienceDays(
			formData.from,
			effectiveToDate
		);

		const sanitizedFormData = trimStrings(formData);

		const normalizedFormData = {
			...sanitizedFormData,
			to: sanitizedFormData.working ? null : sanitizedFormData.to,
			experience: experienceDays
		};

		try {
			const basePayload = mapExperienceDetailsFormToApi(normalizedFormData, candidateId);

			const payload = isEditMode
				? { ...basePayload, workExperienceId: editingRow.workExperienceId }
				: basePayload;

			setLoading(true);

			await profileApi.postExperienceDetails(
				candidateId,
				payload,
				certificateFile
			);

			toast.success(
				isEditMode
					? "Experience updated successfully"
					: "Experience saved successfully"
			);
			setIsDirty(false);

			handleCancelEdit();
			fetchExperienceDetails();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save experience");
		} finally {
			setLoading(false);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setCertificateFile(file);
			setIsDirty(true);
			setFormErrors(prev => ({ ...prev, certificate: "" }));
		}
	};

	const handleBrowse = () => {
		document.getElementById("educationCertInput").click();
	};

	const saveWorkStatusAndProceed = async () => {
		try {
			const effectiveFresherStatus = showFresherOption ? isFresher : false;
			const payload = { isFresher: effectiveFresherStatus };
			
			await profileApi.postWorkStatus(candidateId, effectiveFresherStatus);

			setIsDirty(false);
			goNext();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save work status");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// RULE 1: Fresher is allowed
		if (isFresher === true) {
			await saveWorkStatusAndProceed();
			return;
		}
		// RULE 2: At least one experience must exist
		if (experienceList.length === 0) {
			toast.error(
				"Please add at least one experience or mark yourself as a fresher"
			);
			return;
		}

		for (let i = 0; i < experienceList.length; i++) {
			const row = experienceList[i];
			const errors = validateExperienceRow(row);

			if (Object.keys(errors).length > 0) {
				// 1. Force edit mode
				setIsEditMode(true);
				setEditingRow(row);

				// 2. Populate form with row data
				setFormData({
					organization: row.organization,
					role: row.role,
					postHeld: row.postHeld,
					from: row.from,
					to: row.to,
					working: row.working === "Yes" || row.working === true,
					description: row.description,
					experience: row.experience,
					currentCTC: String(row.currentCTC || "")
				});

				setExistingDocument(row.certificate || null);
				setCertificateFile(null);

				// 3. Inject errors into form
				setFormErrors(errors);

				toast.error(`Please fill the incomplete details before proceeding`);
				return; // ⛔ BLOCK NAVIGATION
			}
		}

		// ✅ Valid case
		await saveWorkStatusAndProceed();
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
		console.log(item)
		// 🔑 EXISTING FILE FROM API
		setExistingDocument(item.certificate || null);
		// User has NOT uploaded a new file yet
		setCertificateFile(null);
	};

	const handleCancelEdit = () => {
		setIsEditMode(false);
		setEditingRow(null);
		setCertificateFile(null);
		setExistingDocument(null);
		setFormData({
			organization: "",
			role: "",
			postHeld: "",
			from: "",
			to: "",
			working: false,
			description: "",
			experience: 0,
			currentCTC: ""
		});
	};

	const handleDelete = async (item) => {
		if (!item?.workExperienceId) {
			toast.error("Invalid experience selected");
			return;
		}
		// const confirmDelete = window.confirm(
		// 	"Are you sure you want to delete this experience?"
		// );
		// if (!confirmDelete) return;
		try {
			setLoading(true);
			await profileApi.deleteExperienceDetails(item.workExperienceId);
			toast.success("Experience deleted successfully");
			// Always re-fetch — backend is source of truth
			fetchExperienceDetails();
			// If user was editing the same row, reset form
			if (editingRow?.workExperienceId === item.workExperienceId) {
				handleCancelEdit();
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to delete experience");
		} finally {
			setLoading(false);
		}
	};

	const handleCTCChange = (e) => {
		let value = e.target.value;

		setFormData(prev => ({
			...prev,
			currentCTC: value
		}));

		if (formErrors.currentCTC) {
			setFormErrors(prev => ({ ...prev, currentCTC: "" }));
		}
	};


	const blockCTCKeys = (e) => {
		const blocked = ["e", "E", "+", "-", ","];
		if (blocked.includes(e.key)) {
			e.preventDefault();
		}
	};

	const formatFileSize = (size) => {
		if (!size) return "";
		const kb = size / 1024;
		if (kb < 1024) return kb.toFixed(1) + " KB";
		return (kb / 1024).toFixed(1) + " MB";
	};

	return (
		<div className="px-4 py-3 border rounded bg-white">
			{showFresherOption && (
				<div className='col-md-2 col-sm-12 d-flex align-items-center gap-2 py-1 px-2 rounded' style={{ backgroundColor: '#fff7ed', border: '1px solid #e7946dff' }}>
					<Form.Check
						type="checkbox"
						id="fresherCheckbox"
						label="I'm fresher"
						checked={isFresher}
						onChange={(e) => {
							setIsFresher(e.target.checked);
							setIsDirty(true);
						}}
						style={{ fontSize: '14px', color: '#6e6e6e', fontWeight: 500 }}
					/>
				</div>
			)}
			<form className="row g-4 formfields mt-2"
				onSubmit={handleSubmit}
				// onInvalid={handleInvalid}
				// onInput={handleInput}
				noValidate
			>
				{/* <p className="tab_headers" style={{ marginBottom: '0px' }}>Experience Details</p> */}

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="organization" className="form-label">Organization <span className="text-danger">*</span></label>
					<input type="text" className={`form-control ${formErrors.organization ? "is-invalid" : ""}`} id="organization" value={formData.organization} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
					{formErrors.organization && (
						<div className="invalid-feedback">{formErrors.organization}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="role" className="form-label">Role <span className="text-danger">*</span></label>
					<input type="text" className={`form-control ${formErrors.role ? "is-invalid" : ""}`} id="role" value={formData.role} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
					{formErrors.role && (
						<div className="invalid-feedback">{formErrors.role}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="postHeld" className="form-label">Post Held <span className="text-danger">*</span></label>
					<input type="text" className={`form-control ${formErrors.postHeld ? "is-invalid" : ""}`} id="postHeld" value={formData.postHeld} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
					{formErrors.postHeld && (
						<div className="invalid-feedback">{formErrors.postHeld}</div>
					)}
				</div>
				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="from" className="form-label">From <span className="text-danger">*</span></label>
					<input type="date" className={`form-control ${formErrors.from ? "is-invalid" : ""}`} id="from" value={formData.from} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
					{formErrors.from && (
						<div className="invalid-feedback">{formErrors.from}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="to" className="form-label">To {formData.working === false && (<span className="text-danger">*</span>)}</label>
					<input type="date" className={`form-control ${formErrors.to ? "is-invalid" : ""}`} id="to" value={formData.to} onChange={handleChange} disabled={isFresher === true || formData.working === true} required={isFresher === false || formData.working === false} min={formData.from || undefined} />
					{formErrors.to && (
						<div className="invalid-feedback">{formErrors.to}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="working" className="form-label">Presently Working <span className="text-danger">*</span></label>
					<select
						className={`form-select ${formErrors.working ? "is-invalid" : ""}`}
						id="working"
						value={String(formData.working)}
						onChange={(e) =>
							setFormData(prev => ({
								...prev,
								working: e.target.value === "true"
							}))
						}
						disabled={isFresher}
						required={isFresher === false}
					>
						<option value="true">Yes</option>
						<option value="false">No</option>
					</select>
					{formErrors.working && (
						<div className="invalid-feedback">{formErrors.working}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="currentCTC" className="form-label">Current CTC <span className="text-danger">*</span></label>
					<input
						type="number"
						className={`form-control ${formErrors.currentCTC ? "is-invalid" : ""}`}
						id="currentCTC"
						name="currentCTC"
						value={formData.currentCTC}
						disabled={isFresher === true}
						required={isFresher === false}
						onChange={handleCTCChange}
						onKeyDown={blockCTCKeys}
					/>
					{formErrors.currentCTC && (
						<div className="invalid-feedback">{formErrors.currentCTC}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label htmlFor="description" className="form-label">Brief Description <span className="text-danger">*</span></label>
					<textarea className={`form-control ${formErrors.description ? "is-invalid" : ""}`} id="description" rows={4} value={formData.description} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
					{formErrors.description && (
						<div className="invalid-feedback">{formErrors.description}</div>
					)}
				</div>

				<div className="col-md-4 col-sm-12 mt-3">
					<label className="form-label">
						Experience Certificate <span className="text-danger">*</span>
					</label>

					{/* Wrapper to show red border on error */}
					<div
						className={`border rounded ${formErrors.certificate ? "border-danger" : ""
							}`}
					>
						{/* Upload box */}
						{!certificateFile && !existingDocument && (
							<div
								className="d-flex flex-column align-items-center justify-content-center"
								style={{
									minHeight: "100px",
									cursor: isFresher ? "not-allowed" : "pointer",
									opacity: isFresher ? 0.6 : 1
								}}
								onClick={!isFresher ? handleBrowse : undefined}
							>
								<FontAwesomeIcon icon={faUpload} className="text-secondary" />

								<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: 500 }}>
									Click to upload or drag and drop
								</div>

								<div className="text-muted" style={{ fontSize: "12px" }}>
									Max: 2MB (jpg, png, pdf)
								</div>

								<input
									id="educationCertInput"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									hidden
									onChange={handleFileChange}
								/>
							</div>
						)}

						{/* Existing document */}
						{existingDocument && !certificateFile && (
							<div className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
									/>
									<div style={{ fontWeight: 600 }}>
										{existingDocument.displayName ?? existingDocument.fileName}
									</div>
								</div>

								<div className='d-flex gap-2'>
									{/* <img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(existingDocument.fileUrl, "_blank")}
									/> */}
									<div onClick={() => handleEyeClick(existingDocument.fileUrl)}>
																			<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
																			</div>
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "22px", cursor: "pointer" }}
										onClick={() => setExistingDocument(null)}
									/>
								</div>
							</div>
						)}

						{/* New uploaded file */}
						{certificateFile && (
							<div className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
								style={{
									border: "2px solid #bfc8e2",
									borderRadius: "8px",
									background: "#f7f9fc"
								}}
							>
								<div className="d-flex align-items-center">
									<img
										src={greenCheck}
										style={{ fontSize: "22px", marginRight: "10px", width: "22px", height: "22px" }}
									/>
									<div>
										<div style={{ fontWeight: 600 }}>{certificateFile.name}</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(certificateFile.size)}
										</div>
									</div>
								</div>

								<div className='d-flex gap-2'>
									<img
										src={viewIcon}
										alt="View"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => window.open(URL.createObjectURL(certificateFile), "_blank")}
									/>
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "22px", cursor: "pointer" }}
										onClick={() => setCertificateFile(null)}
									/>
								</div>
							</div>
						)}
					</div>

					{/* ❌ Validation error */}
					{formErrors.certificate && (
						<div className="text-danger mt-1" style={{ fontSize: "13px" }}>
							{formErrors.certificate}
						</div>
					)}
				</div>


				<div className="d-flex justify-content-between gap-3 mt-4">
					<div className='d-flex'>
						<img src={bulbIcon} style={{ width: '25px', height: '25px', marginTop: '6px', marginRight: '5px' }}/>
						<p className='orange_text mt-2 mb-0'>If multiple roles/posts were held in the same organization, please record each one separately.</p>
					</div>
					{!isEditMode ? (
						<button
							type="button"
							className="btn blue-button px-4"
							onClick={handleSaveExperience}
							disabled={isFresher}
						>
							Submit
						</button>
					) : (
						<div className="d-flex gap-2">
							<button
								type="button"
								className="btn btn-outline-secondary text-muted"
								onClick={handleCancelEdit}
							>
								Cancel
							</button>

							<button
								type="button"
								className="btn blue-button px-4"
								onClick={handleSaveExperience}
							>
								Update
							</button>
						</div>
					)}
				</div>

				<div className="d-none d-md-block w-100">
					<table className='experience_table w-100'>
						<thead>
							<tr>
								<th className='profile_table_th text-center' style={{ textAlign: 'left', width: '5%' }}>S.No</th>
								<th className='profile_table_th'>Organization</th>
								<th className='profile_table_th'>From</th>
								<th className='profile_table_th'>To</th>
								<th className='profile_table_th'>Experience (in days)</th>
								<th className='profile_table_th'>Role</th>
								<th className='profile_table_th'>Post</th>
								<th className='profile_table_th'>Description</th>
								<th className='profile_table_th'>Actions</th>
							</tr>
						</thead>
						<tbody>
							{experienceList.map((item, index) => (
								<tr style={{ border: '1px solid #dee2e6' }} key={index}>
									<td className='profile_table_td text-center'>{index + 1}</td>
									<td className='profile_table_td'>{item?.organization}</td>
									<td className='profile_table_td'>{item?.from}</td>
									<td className='profile_table_td'>{item?.to}</td>
									<td className='profile_table_td'>{item?.experience}</td>
									<td className='profile_table_td'>{item?.role}</td>
									<td className='profile_table_td'>{item?.postHeld}</td>
									<td className='profile_table_td'>{item?.description}</td>
									<td className='profile_table_td'>
										<div className="d-flex gap-2">
											<div>
												<img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleEdit(item)} />
											</div>
											

											<div onClick={() => handleEyeClick(item?.certificate?.fileUrl)}>
													<img src={viewIcon} alt="View" style={{ width: "25px", cursor: "pointer" }} />
											</div>
											<div>
												<img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleDelete(item)} />
											</div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* MOBILE CARDS */}
				<div className="d-block d-md-none w-100">
					{experienceList.map((item, index) => (
						<div
						key={item.workExperienceId}
						className="border rounded p-3 mb-3 bg-white shadow-sm"
						>
						<div className="d-flex justify-content-between align-items-center mb-2">
							<strong>Experience #{index + 1}</strong>
							<div className="d-flex gap-2">
							<img
								src={editIcon}
								width={22}
								style={{ cursor: "pointer" }}
								onClick={() => handleEdit(item)}
							/>
							<img
								src={viewIcon}
								width={22}
								style={{ cursor: "pointer" }}
								onClick={() => {
								if (!item?.certificate?.fileUrl) {
									toast.error("No document available");
									return;
								}
								window.open(item.certificate.fileUrl, "_blank");
								}}
							/>
							<img
								src={deleteIcon}
								width={22}
								style={{ cursor: "pointer" }}
								onClick={() => handleDelete(item)}
							/>
							</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Organization</small>
							<div className='wrap-text'>{item.organization}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Role</small>
							<div className='wrap-text'>{item.role}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Post Held</small>
							<div className='wrap-text'>{item.postHeld}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">From</small>
							<div className='wrap-text'>{item.from}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">To</small>
							<div className='wrap-text'>{item.to || "-"}</div>
						</div>

						<div className="mb-1">
							<small className="text-muted">Experience (days)</small>
							<div className='wrap-text'>{item.experience}</div>
						</div>

						<div>
							<small className="text-muted">Description</small>
							<div className='wrap-text'>{item.description}</div>
						</div>
						</div>
					))}
				</div>

				<div className='d-flex justify-content-center align-items-center gap-2'>
					<label htmlFor="working" className="form-label mb-0">Total experience in months</label>
					<input type="number" className="form-control text-center" style={{ width: '70px', paddingLeft: '25px' }} id="to" disabled value={totalExperienceMonths} />
				</div>

				{/* <div className='d-flex justify-content-center align-items-center gap-2 py-1' style={{ backgroundColor: '#fff7ed', borderLeft: '3px solid #f26623' }}>
						<input
							type="checkbox"
							// className="form-control"
							id="declarationCheckbox"
							// checked={sameAsCorrespondence}
							// onChange={handleCheckboxToggle}
						/>
						<label htmlFor="declarationCheckbox" className="form-label mt-1">I declare that I possess the requisite work experience for this post, 
							as stipulated in terms of the advertisement, and undertake to submit neccessary documents/testimonials in support of the same as and when called for by the Bank.
						</label>
					</div> */}

				<div className="d-flex justify-content-between">
					<div>
						<BackButtonWithConfirmation goBack={goBack} isDirty={isDirty} />
					</div>
					<div>
						<button
							type="submit"
							className="btn btn-primary"
							style={{
								backgroundColor: "#ff7043",
								border: "none",
								padding: "0.6rem 2rem",
								borderRadius: "4px",
								color: "#fff",
								fontSize: '0.875rem'
							}}
						>
							Save & Next
							<FontAwesomeIcon icon={faChevronRight} size='sm' className="ms-2" />
						</button>
					</div>
				</div>
			</form>

			{loading && (
				<Loader />
			)}

		</div>
	)
}

export default ExperienceDetails