import { faCheckCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react'
import deleteIcon from '../../assets/delete-icon.png';
import editIcon from '../../assets/edit-icon.png';
import viewIcon from '../../assets/view-icon.png';

const BasicDetails = ({ goNext, goBack }) => {
	const [isDisabledPerson, setIsDisabledPerson] = useState("No");
  const [isExService, setIsExService] = useState("No");
	const [twinSibling, setTwinSibling] = useState("No");
	const [disabilityCertificate, setDisabilityCertificate] = useState(null);
	const [serviceCertificate, setServiceCertificate] = useState(null);

	const handleDisabilityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setDisabilityCertificate(file);
  };

	const handleDisabilityBrowse = () => {
		document.getElementById("disabilityCertificate").click();
	};

	const handleServiceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setServiceCertificate(file);
  };

	const handleServiceBrowse = () => {
		document.getElementById("serviceCertificate").click();
	};

	const formatFileSize = (size) => {
		if (!size) return "";
		const kb = size / 1024;
		if (kb < 1024) return kb.toFixed(1) + " KB";
		return (kb / 1024).toFixed(1) + " MB";
	};

	const handleSubmit = (e) => {
    e.preventDefault();
    goNext();   // Move to next step
  };

  return (
		<div>
				<form className="row g-4 formfields"
					onSubmit={handleSubmit}
					// onInvalid={handleInvalid}
					// onInput={handleInput}
				>
				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Personal Details</p>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="firstName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="middleName" className="form-label">Middle Name</label>
						<input type="text" className="form-control" id="middleName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="lastName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullName" className="form-label">Full Name as per Aadhar Card <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="fullName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullName" className="form-label">Full Name as per SSC/Birth certificate <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="fullName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="gender"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Other">Other</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
						<input type="date" className="form-control" id="dob" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="maritalStatus" className="form-label">Marital Status <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="maritalStatus"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="Single">Single</option>
							<option value="Married">Married</option>
							<option value="Divorced">Divorced</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="nationality" className="form-label">Nationality/Citizenship <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="nationality"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="Indian">Indian</option>
							<option value="American">American</option>
							<option value="British">British</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="religion" className="form-label">Religion <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="religion"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="Hindu">Hindu</option>
							<option value="Christian">Christian</option>
							<option value="Muslim">Muslim</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="category"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="OBC">OBC</option>
							<option value="SC">SC</option>
							<option value="ST">ST</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="caste" className="form-label">Community/Caste <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="caste"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="Reddy">Reddy</option>
							<option value="Naidu">Naidu</option>
							<option value="Chowdary">Chowdary</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="casteState" className="form-label">State to which belong for SC/ST/OBC</label>
						<select
							className="form-select"
							id="casteState"
							// value={formData.gender}
							// onChange={handleChange}
						
						>
							<option value="Others 1">Others 1</option>
							<option value="Others 2">Others 2</option>
							<option value="Others 3">Others 3</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="motherName" className="form-label">Mother Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="motherName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fatherName" className="form-label">Father Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="fatherName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="spouseName" className="form-label">Spouse Name</label>
						<input type="text" className="form-control" id="spouseName" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="contactNumber" className="form-label">Contact Number <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="contactNumber" />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="altNumber" className="form-label">Alternative Number</label>
						<input type="text" className="form-control" id="altNumber" />
					</div>

					{/* <div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="currentCTC" className="form-label">Current CTC (in Lakhs) <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="currentCTC" />
					</div> */}

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="socailMediaLink" className="form-label">Socail Media Profile Link</label>
						<input type="text" className="form-control" id="socailMediaLink" />
					</div>
				</div>

					<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Siblings</p>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="twinSibling" className="form-label">Do you have a twin sibling? <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="twinSibling"
							// value={formData.gender}
							// onChange={handleChange}
							value={twinSibling}
    					onChange={(e) => setTwinSibling(e.target.value)}
						>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="siblingName" className="form-label">Twin Sibling's Name</label>
						<input type="text" className="form-control" id="siblingName" disabled={twinSibling === "No"} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="twinGender" className="form-label">Gender of the twin</label>
						<select
							className="form-select"
							id="twinGender"
							// value={formData.gender}
							// onChange={handleChange}
							disabled={twinSibling === "No"}
						>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Others">Others</option>
						</select>
					</div>
					</div>

					<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Disability</p>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="disability" className="form-label">Person with Disability? <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="disability"
							// value={formData.gender}
							// onChange={handleChange}
							value={isDisabledPerson}
    					onChange={(e) => setIsDisabledPerson(e.target.value)}
						
						>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="disabilityType" className="form-label">Type of Disability</label>
						<select
							className="form-select"
							id="disabilityType"
							// value={formData.gender}
							// onChange={handleChange}
							disabled={isDisabledPerson === "No"}
						>
							<option value="Physically Handicapped">Physically Handicapped</option>
							<option value="Visually Impaired">Visually Impaired</option>
							<option value="Impaired Hearing">Impaired Hearing</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="disabilityPercentage" className="form-label">Disability Percentage</label>
						<select
							className="form-select"
							id="disabilityPercentage"
							// value={formData.gender}
							// onChange={handleChange}
							disabled={isDisabledPerson === "No"}
						>
							<option value="10% - 50%">10% - 50%</option>
							<option value="50% - 100%">50% - 100%</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="scribeRequirement" className="form-label">Scribe Requirement</label>
						<select
							className="form-select"
							id="scribeRequirement"
							// value={formData.gender}
							// onChange={handleChange}
							disabled={isDisabledPerson === "No"}
						>
							<option value="Others 1">Others 1</option>
							<option value="Other 2">Other 2</option>
						</select>
					</div>

					<div className="col-md-6 col-sm-12 mt-2">
						<label htmlFor="disabilityCertificate" className="form-label">Upload Certificate</label>
						{!disabilityCertificate && (
						<div
							className="border rounded d-flex flex-column align-items-center justify-content-center"
							style={{
								minHeight: "100px",
								cursor: isDisabledPerson === 'No' ? "not-allowed" : "pointer",
								opacity: isDisabledPerson === 'No' ? 0.6 : 1
							}}
							onClick={isDisabledPerson === 'Yes' ? handleDisabilityBrowse : undefined}
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
								id="disabilityCertificate"
								type="file"
								accept=".jpg,.jpeg,.png,.pdf"
								style={{ display: "none" }}
								onChange={handleDisabilityFileChange}
							/>
						</div>
						)}

						{/* Show File Name */}
						{disabilityCertificate && (
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
											{disabilityCertificate.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(disabilityCertificate.size)}
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
										onClick={() => window.open(URL.createObjectURL(disabilityCertificate), "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									<img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => document.getElementById("disabilityCertificate").click()}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setDisabilityCertificate(null)}
									/>

								</div>
							</div>
						)}
						</div>
					</div>

					<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Ex-Service Person</p>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="servicePerson" className="form-label">Ex Service Person?</label>
						<select
							className="form-select"
							id="servicePerson"
							// value={formData.gender}
							// onChange={handleChange}
							value={isExService}
    					onChange={(e) => setIsExService(e.target.value)}
						>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="serviceEnrollment" className="form-label">Service Start Enrollment Date</label>
						<input type="date" className="form-control" id="serviceEnrollment" disabled={isExService === "No"} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="dischargeDate" className="form-label">Discharge Date</label>
						<input type="date" className="form-control" id="dischargeDate" disabled={isExService === "No"} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="servicePeriod" className="form-label">Service Period (in Months)</label>
						<input type="number" className="form-control" id="servicePeriod" disabled={isExService === "No"} />
					</div>
					<div className='col-md-6 d-flex flex-column'>
						<div className="col-md-12 col-sm-12 d-grid">
							<div>
								<label className="form-label">
									Have you already secured regular employment under the Central Govt. in a civil post?
								</label>
							</div>

							<div>
								<input type="radio" id="employmentSecuredYes" name="employmentSecured" value="Yes" />
								<label htmlFor="employmentSecuredYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

								<input type="radio" id="employmentSecuredNo" name="employmentSecured" value="No" style={{ marginLeft: '1rem' }} />
								<label htmlFor="employmentSecuredNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
							</div>
						</div>

						<div className="col-md-12 col-sm-12 mt-3 d-grid">
							<div>
								<label className="form-label">
									If Yes, then are you at present serving at a post lower than the one advertised?
								</label>
							</div>

							<div>
								<input type="radio" id="lowerPostYes" name="lowerPostStatus" value="Yes" />
								<label htmlFor="lowerPostYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

								<input type="radio" id="lowerPostNo" name="lowerPostStatus" value="No" style={{ marginLeft: '1rem' }} />
								<label htmlFor="lowerPostNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
							</div>
						</div>
					</div>
					<div className="col-md-6 col-sm-12 mt-2">
						<label htmlFor="serviceCertificate" className="form-label">Upload Certificate</label>
						{!serviceCertificate && (
						<div
							className="border rounded d-flex flex-column align-items-center justify-content-center"
							style={{
								minHeight: "100px",
								cursor: isExService === 'No' ? "not-allowed" : "pointer",
								opacity: isExService === 'No' ? 0.6 : 1
							}}
							onClick={isExService === 'Yes' ? handleServiceBrowse : undefined}
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
								id="serviceCertificate"
								type="file"
								accept=".jpg,.jpeg,.png,.pdf"
								style={{ display: "none" }}
								onChange={handleServiceFileChange}
							/>
						</div>
						)}

						{/* Show File Name */}
						{serviceCertificate && (
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
											{serviceCertificate.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(serviceCertificate.size)}
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
										onClick={() => window.open(URL.createObjectURL(serviceCertificate), "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									<img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => document.getElementById("serviceCertificate").click()}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setServiceCertificate(null)}
									/>

								</div>
							</div>
						)}
					</div>
					</div>

					<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Language Profiency</p>

					<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="language1" className="form-label">Language 1 <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="language1"
						// value={formData.gender}
						// onChange={handleChange}
						required
					>
						<option value="Male">Telugu</option>
						<option value="Female">Hindi</option>
						<option value="Other">English</option>
					</select>
					<div className="d-flex">
						<div className="d-flex align-items-center">
							<input type="checkbox" id="read1" />
							<label htmlFor="read1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="write1" style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="speak1" style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="speak1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Speak</label>
						</div>
					</div>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="language2" className="form-label">Language 2 <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="language2"
						// value={formData.gender}
						// onChange={handleChange}
						required
					>
						<option value="Male">Telugu</option>
						<option value="Female">Hindi</option>
						<option value="Other">English</option>
					</select>
					<div className="d-flex">
						<div className="d-flex align-items-center">
							<input type="checkbox" id="read1" />
							<label htmlFor="read1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="write1" style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="speak1" style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="speak1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Speak</label>
						</div>
					</div>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="language3" className="form-label">Language 3 <span className="text-danger">*</span></label>
					<select
						className="form-select"
						id="language3"
						// value={formData.gender}
						// onChange={handleChange}
						required
					>
						<option value="Male">Telugu</option>
						<option value="Female">Hindi</option>
						<option value="Other">English</option>
					</select>
					<div className="d-flex">
						<div className="d-flex align-items-center">
							<input type="checkbox" id="read1" />
							<label htmlFor="read1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="write1" style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="speak1" style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="speak1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Speak</label>
						</div>
					</div>
				</div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
				<div className="col-md-6 col-sm-12 mt-4 d-grid">
					<div>
						<label className="form-label">
							Are you a child/family member of those who died in 1984 riots?
						</label>
					</div>

					<div>
						<input type="radio" id="riotYes" name="riot" value="Yes" />
						<label htmlFor="riotYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="riotNo" name="riot" value="No" style={{ marginLeft: '1rem' }} />
						<label htmlFor="riotNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
					</div>
				</div>

				<div className="col-md-6 col-sm-12 mt-4 d-grid">
					<div>
						<label className="form-label">
							Whether serving in Govt./quasi Govt./Public Sector Undertaking?
						</label>
					</div>

					<div>
						<input type="radio" id="psuYes" name="psu" value="Yes" />
						<label htmlFor="psuYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="psuNo" name="psu" value="No" style={{ marginLeft: '1rem' }} />
						<label htmlFor="psuNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
					</div>
				</div>

				<div className="col-md-6 col-sm-12 mt-3 d-grid">
					<div>
						<label className="form-label">
							Do you belong to Religious Minority Community?
						</label>
					</div>

					<div>
						<input type="radio" id="rmcYes" name="rmc" value="Yes" />
						<label htmlFor="rmcYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="rmcNo" name="rmc" value="No" style={{ marginLeft: '1rem' }} />
						<label htmlFor="rmcNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
					</div>
				</div>

				<div className="col-md-6 col-sm-12 mt-3 d-grid">
					<div>
						<label className="form-label">
							Any disciplinary action in any of your previous/current employment?
						</label>
					</div>

					<div>
						<input type="radio" id="disciplineActionYes" name="disciplineAction" value="Yes" />
						<label htmlFor="disciplineActionYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="disciplineActionNo" name="disciplineAction" value="No" style={{ marginLeft: '1rem' }} />
						<label htmlFor="disciplineActionNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
					</div>
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
			</div>

			</form>
		</div>
  )
}

export default BasicDetails