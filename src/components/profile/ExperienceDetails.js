import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react'
import deleteIcon from '../../assets/delete-icon.png';
import editIcon from '../../assets/edit-icon.png';
import viewIcon from '../../assets/view-icon.png';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons/faCheckCircle';

const ExperienceDetails = ({ goNext, goBack }) => {
		const [experienceList, setExperienceList] = useState([]);
		const [certificateFile, setCertificateFile] = useState(null);
		const [totalExperienceMonths, setTotalExperienceMonths] = useState(0);
		const [isFresher, setIsFresher] = useState(false);
		const [formData, setFormData] = useState({
				organization: "",
				role: "",
				postHeld: "",
				from: "",
				to: "",
				working: "",
				description: "",
				experience: 0
		});

		useEffect(() => {
			let totalDays = experienceList.reduce((sum, item) => sum + (item.experience || 0), 0);
			let months = Math.floor(totalDays / 30);
			setTotalExperienceMonths(months);
		}, [experienceList]);

		const handleChange = (e) => {
			const { id, value } = e.target;
			let updated = { ...formData, [id]: value };

			// Auto-calc experience when both dates are selected
			if ((id === "from" || id === "to") && updated.from && updated.to) {
					const start = new Date(updated.from);
					const end = new Date(updated.to);
					const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
					updated.experience = diff >= 0 ? diff : 0;
			}
			setFormData(updated);
		};


	const handleAddRow = () => {
		setExperienceList([...experienceList, { ...formData }]);
		setFormData({
			organization: "",
			role: "",
			postHeld: "",
			from: "",
			to: "",
			working: "",
			description: "",
			experience: 0
		});
		setCertificateFile(null);
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) setCertificateFile(file);
	};

	const handleBrowse = () => {
		document.getElementById("educationCertInput").click();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		goNext();   // Move to next step
	};

	const formatFileSize = (size) => {
		if (!size) return "";
		const kb = size / 1024;
		if (kb < 1024) return kb.toFixed(1) + " KB";
		return (kb / 1024).toFixed(1) + " MB";
	};

	return (
		<div className="px-4 py-3 border rounded bg-white">
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
			<form className="row g-4 formfields mt-2"
				onSubmit={handleSubmit}
				// onInvalid={handleInvalid}
				// onInput={handleInput}
			>
				{/* <p className="tab_headers" style={{ marginBottom: '0px' }}>Experience Details</p> */}
					
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="organization" className="form-label">Organization <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="organization" value={formData.organization} onChange={handleChange} disabled={isFresher === true} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="role" className="form-label">Role <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="role" value={formData.role} onChange={handleChange} disabled={isFresher === true} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="postHeld" className="form-label">Post Held <span className="text-danger">*</span></label>
					<input type="text" className="form-control" id="postHeld" value={formData.postHeld} onChange={handleChange} disabled={isFresher === true} />
				</div>
				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="from" className="form-label">From <span className="text-danger">*</span></label>
					<input type="date" className="form-control" id="from" value={formData.from} onChange={handleChange} disabled={isFresher === true} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="to" className="form-label">To <span className="text-danger">*</span></label>
					<input type="date" className="form-control" id="to" value={formData.to} onChange={handleChange} disabled={isFresher === true} />
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="working" className="form-label">Presently Working <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="working"
						value={formData.working}
						onChange={handleChange}
						disabled={isFresher === true}
					>
						<option value="Yes">Yes</option>
						<option value="No">No</option>
					</select>
				</div>

				<div className="col-md-6 col-sm-12 mt-2">
					<label htmlFor="description" className="form-label">Brief Description <span className="text-danger">*</span></label>
					<textarea className="form-control" id="description" rows={4} value={formData.description} onChange={handleChange} disabled={isFresher === true} />
				</div>

				<div className="col-md-6 col-sm-12 mt-2">
					<label htmlFor="eduCert" className="form-label">Experience Certificate <span className="text-danger">*</span></label>
					{!certificateFile && (
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
										{certificateFile.name}
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
									onClick={() => document.getElementById("educationCertInput").click()}
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

				<div className='d-flex justify-content-center mt-2'>
						<button type="button" className="btn blue-button mt-3" onClick={handleAddRow} disabled={isFresher === true}>Submit</button>
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
											<img src={editIcon} alt='Edit' style={{ width: '25px', cursor: 'pointer' }} />
										</div>
										<div>
											<img src={deleteIcon} alt='Delete' style={{ width: '25px', cursor: 'pointer' }} />
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

					<div className='d-flex justify-content-center align-items-center gap-2 py-1' style={{ backgroundColor: '#fff7ed', borderLeft: '3px solid #f26623' }}>
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
					</div>

					<div className="d-flex justify-content-between">
		<div>
			<button type="button" className="btn btn-outline-secondary" onClick={goBack}>Back</button>
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