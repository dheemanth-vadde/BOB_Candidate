import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react'
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';
import profileApi from '../services/profile.api';
import { useSelector } from 'react-redux';
import { mapExperienceApiToUi, mapExperienceDetailsFormToApi } from '../mappers/ExperienceMapper';
import { toast } from 'react-toastify';
import { validateEndDateAfterStart, validateNonEmptyText } from '../../../shared/utils/validation';

const ExperienceDetails = ({ goNext, goBack }) => {
	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;
	const email = user?.user?.email
	const createdBy = user?.user?.id;
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
		const [formData, setFormData] = useState({
				organization: "",
				role: "",
				postHeld: "",
				from: "",
				to: "",
				working: false,
				description: "",
				experience: 0,
				currentCTC: 0
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

		useEffect(() => {
			if (!formData.working || !formData.from) return;
			const interval = setInterval(() => {
				setFormData(prev => ({
					...prev,
					experience: calculateExperienceDays(prev.from, null)
				}));
			}, 24 * 60 * 60 * 1000); // every day
			return () => clearInterval(interval);
		}, [formData.working, formData.from]);

		useEffect(() => {
			const fetchWorkStatus = async () => {
				try {
					const res = await profileApi.getWorkStatus(candidateId);
					const fresherStatus = Boolean(res?.data?.data);
					setIsFresher(fresherStatus);
				} catch (err) {
					console.error("Failed to fetch work status", err);
				}
			};
			if (candidateId) {
				fetchWorkStatus();
			}
		}, [candidateId]);

		const calculateExperienceDays = (fromDate, toDate) => {
			if (!fromDate) return 0;
			const start = new Date(fromDate);
			const end = toDate ? new Date(toDate) : new Date(); // 🔑 TODAY if working
			const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
			return diff > 0 ? diff : 0;
		};

		const handleChange = (e) => {
			const { id, value } = e.target;
			let updated = {
				...formData,
				[id]: value
			};
			// Recalculate experience correctly
			if (id === "from" || id === "to" || id === "working") {
				updated.experience = calculateExperienceDays(
					updated.from,
					updated.working ? null : updated.to
				);
			}
			setFormData(updated);
		};

		const fetchExperienceDetails = async () => {
			try {
				const res = await profileApi.getExperienceDetails(candidateId);
				const apiList = Array.isArray(res?.data?.data)
					? res.data.data
					: [];
				const mappedList = apiList.map(mapExperienceApiToUi);
				setExperienceList(mappedList);
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
			}
		};

		useEffect(() => {
			fetchExperienceDetails();
		}, [candidateId]);

		const handleSaveExperience = async () => {
			try {
				if (!formData.from) {
					toast.error("From date is required");
					return;
				}

				if (!formData.working && !formData.to) {
					toast.error("To date is required if not presently working");
					return;
				}

				const textFields = [
					{ value: formData.organization, label: "Organization" },
					{ value: formData.role, label: "Role" },
					{ value: formData.postHeld, label: "Post Held" },
					{ value: formData.description, label: "Description" },
				];

				for (const field of textFields) {
					const { isValid } = validateNonEmptyText(field.value);
					if (!isValid) {
						toast.error(`${field.label} cannot be empty or whitespace`);
						return;
					}
				}

				if (!formData.working) {
					const { isValid, error } = validateEndDateAfterStart(
						formData.from,
						formData.to
					);

					if (!isValid) {
						toast.error(error);
						return;
					}
				}

				const basePayload = mapExperienceDetailsFormToApi(formData, candidateId);
				const payload = isEditMode
					? {
							...basePayload,
							workExperienceId: editingRow.workExperienceId, // 🔑 decides UPDATE
						}
					: basePayload; // 🔑 decides CREATE

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

				handleCancelEdit();   // resets form + edit state
				fetchExperienceDetails();
			} catch (err) {
				console.error(err);
				toast.error(
					isEditMode
						? "Failed to update experience"
						: "Failed to save experience"
				);
			}
		};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) setCertificateFile(file);
	};

	const handleBrowse = () => {
		document.getElementById("educationCertInput").click();
	};

	const saveWorkStatusAndProceed = async () => {
		try {
			const effectiveFresherStatus = showFresherOption ? isFresher : false;
			await profileApi.postWorkStatus(candidateId, effectiveFresherStatus);
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
			currentCTC: item.currentCTC
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
			currentCTC: 0
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
		}
	};

	const handleCTCChange = (e) => {
		let value = e.target.value;
		// Empty → 0
		if (value === "") {
			setFormData(prev => ({ ...prev, currentCTC: 0 }));
			return;
		}
		value = Number(value);
		// NaN, negative, infinity → 0
		if (!Number.isFinite(value) || value < 0) {
			value = 0;
		}
		setFormData(prev => ({
			...prev,
			currentCTC: value
		}));
	};

	const blockCTCKeys = (e) => {
		const blocked = ["e", "E", "+", "-", ".", ","];
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
					<input
						type="checkbox"
						// className="form-control"
						id="fresherCheckbox"
						checked={isFresher}
						onChange={(e) => setIsFresher(e.target.checked)}
					/>
					<label htmlFor="fresherCheckbox" className="form-label mt-1" style={{ fontSize: '14px', color: '#6e6e6e', fontWeight: 500 }}>I'm fresher</label>
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
					<input type="text" className="form-control" id="organization" value={formData.organization} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="role" className="form-label">Role <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="role" value={formData.role} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="postHeld" className="form-label">Post Held <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="postHeld" value={formData.postHeld} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
				</div>
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="from" className="form-label">From <span className="text-danger">*</span></label>
					<input type="date" className="form-control" id="from" value={formData.from} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="to" className="form-label">To {formData.working === false && (<span className="text-danger">*</span>)}</label>
					<input type="date" className="form-control" id="to" value={formData.to} onChange={handleChange} disabled={isFresher === true || formData.working === true}  required={isFresher === false || formData.working === false} min={formData.from || undefined} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="working" className="form-label">Presently Working <span className="text-danger">*</span></label>
					<select
						className="form-select"
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
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="currentCTC" className="form-label">Current CTC <span className="text-danger">*</span></label>
					<input
						type="number"
						className="form-control"
						id="currentCTC"
						name="currentCTC"
						value={formData.currentCTC}
						min={0}
						step={1}
						disabled={isFresher === true}
						required={isFresher === false}
						onChange={handleCTCChange}
						onKeyDown={blockCTCKeys}
					/>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="description" className="form-label">Brief Description <span className="text-danger">*</span></label>
					<textarea className="form-control" id="description" rows={4} value={formData.description} onChange={handleChange} disabled={isFresher === true} required={isFresher === false} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="eduCert" className="form-label">Experience Certificate <span className="text-danger">*</span></label>
					{!certificateFile && !existingDocument && (
					<div
						className="border rounded d-flex flex-column align-items-center justify-content-center"
						style={{
							minHeight: "100px",
							cursor: isFresher ? "not-allowed" : "pointer",
							opacity: isFresher ? 0.6 : 1
						}}
						onClick={!isFresher ? handleBrowse : undefined}
					>
						{/* Upload Icon */}
						<FontAwesomeIcon
							icon={faUpload}
							className="me-2 text-secondary"
						/>

						{/* Upload Text */}
						<div className="mt-2" style={{ color: "#7b7b7b", fontWeight: "500" }}>
						Click to upload or drag and drop
						</div>

						<div className="text-muted" style={{ fontSize: "12px" }}>
						Max: 2MB picture
						</div>

						{/* Hidden File Input */}
						<input
							id="educationCertInput"
							type="file"
							accept=".jpg,.jpeg,.png,.pdf"
							style={{ display: "none" }}
							onChange={handleFileChange}
						/>
					</div>
					)}

					{/* Show File Name */}
					{existingDocument && !certificateFile && (
						<div
							className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
							style={{
								border: "2px solid #bfc8e2",
								borderRadius: "8px",
								background: "#f7f9fc"
							}}
						>
							{/* LEFT SIDE: Check icon + File name + size */}
							<div className="d-flex align-items-center">
								<FontAwesomeIcon
									icon={faCheckCircle}
									style={{ color: "green", fontSize: "22px", marginRight: "10px" }}
								/>

								<div>
									<div style={{ fontWeight: 600, color: "#42579f" }}>
										{existingDocument?.fileName}
									</div>
									{/* <div className="text-muted" style={{ fontSize: "12px" }}>
										{formatFileSize(certificateFile.size || existingDocument)}
									</div> */}
								</div>
							</div>

							{/* RIGHT SIDE: View / Edit / Delete */}
							<div className="d-flex gap-2">

								{/* View */}
								<img
									src={viewIcon}
									alt="View"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={() => window.open(existingDocument.fileUrl, "_blank")}
								/>

								{/* Delete */}
								<img
									src={deleteIcon}
									alt="Delete"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={() => setExistingDocument(null)}
								/>

							</div>
						</div>
					)}

					{certificateFile && (
						<div
							className="uploaded-file-box p-3 d-flex justify-content-between align-items-center"
							style={{
								border: "2px solid #bfc8e2",
								borderRadius: "8px",
								background: "#f7f9fc"
							}}
						>
							{/* LEFT SIDE: Check icon + File name + size */}
							<div className="d-flex align-items-center">
								<FontAwesomeIcon
									icon={faCheckCircle}
									style={{ color: "green", fontSize: "22px", marginRight: "10px" }}
								/>

								<div>
									<div style={{ fontWeight: 600, color: "#42579f" }}>
										{certificateFile?.name}
									</div>
									<div className="text-muted" style={{ fontSize: "12px" }}>
										{formatFileSize(certificateFile.size)}
									</div>
								</div>
							</div>

							{/* RIGHT SIDE: View / Edit / Delete */}
							<div className="d-flex gap-2">

								{/* View */}
								<img
									src={viewIcon}
									alt="View"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={() => window.open(URL.createObjectURL(certificateFile), "_blank")}
								/>

								{/* Edit → triggers file re-upload */}
								<img
									src={editIcon}
									alt="Edit"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={handleBrowse}
								/>

								{/* Delete */}
								<img
									src={deleteIcon}
									alt="Delete"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={() => setCertificateFile(null)}
								/>

							</div>
						</div>
					)}
				</div>

				<div className="d-flex justify-content-center gap-3 mt-3">
					{!isEditMode ? (
						<button
							type="button"
							className="btn blue-button"
							onClick={handleSaveExperience}
							disabled={isFresher}
						>
							Submit
						</button>
					) : (
						<>
							<button
								type="button"
								className="btn btn-outline-secondary text-muted"
								onClick={handleCancelEdit}
							>
								Cancel
							</button>

							<button
								type="button"
								className="btn blue-button"
								onClick={handleSaveExperience}
							>
								Update
							</button>
						</>
					)}
				</div>

				<table>
					<thead>
						<tr>
							<th className='profile_table_th text-center'>S.No</th>
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
											<img src={viewIcon} alt='View' style={{ width: '25px', cursor: 'pointer' }} />
										</div>
										<div>
											<img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} onClick={() => handleEdit(item)} />
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
			<button type="button" className="btn btn-outline-secondary text-muted" onClick={goBack}>Back</button>
		</div>
		<div>
			<button
				type="submit"
				className="btn btn-primary"
				style={{
					backgroundColor: "#ff7043",
					border: "none",
					padding: "8px 24px",
					borderRadius: "4px",
					color: "#fff"
				}}
			>Save and Next</button>
		</div>
	</div>
			</form>
		</div>
	)
}

export default ExperienceDetails