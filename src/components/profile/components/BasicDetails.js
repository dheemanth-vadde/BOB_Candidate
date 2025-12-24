import { faCheckCircle, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react'
import deleteIcon from '../../../assets/delete-icon.png';
import editIcon from '../../../assets/edit-icon.png';
import viewIcon from '../../../assets/view-icon.png';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { mapBasicDetailsApiToForm, mapBasicDetailsFormToApi } from '../mappers/BasicMapper';
import masterApi from '../../../services/master.api';
import { toast } from 'react-toastify';
import { validateEndDateAfterStart } from '../../../shared/utils/validation';

const BasicDetails = ({ goNext, goBack }) => {
	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;
	const email = user?.user?.email
	const createdBy = user?.user?.id;
	// const email = "sumanthsangam2@gmail.com"
	// const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	// const createdBy = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	const [formData, setFormData] = useState({
		firstName: "",
		middleName: "",
		lastName: "",
		fullNameAadhar: "",
		fullNameSSC: "",
		gender: "",
		dob: "",
		maritalStatus: "",
		nationality: "",
		religion: "",
		category: "",
		caste: "",
		casteState: "",
		motherName: "",
		fatherName: "",
		spouseName: "",
		contactNumber: "",
		altNumber: "",
		socialMediaLink: "",

		twinSibling: false,
		siblingName: "",
		twinGender: "",

		isDisabledPerson: false,
		disabilityType: "",
		disabilityPercentage: "",
		scribeRequirement: "",
		disabilityCertificate: null,

		isExService: false,
		serviceEnrollment: "",
		dischargeDate: "",
		servicePeriod: "",
		employmentSecured: "",
		lowerPostStatus: "",
		serviceCertificate: null,

		riotVictimFamily: "",
		servingInGovt: "",
		minorityCommunity: "",
		disciplinaryAction: "",

		language1: "",
		language1Read: false,
		language1Write: false,
		language1Speak: false,

		language2: "",
		language2Read: false,
		language2Write: false,
		language2Speak: false,

		language3: "",
		language3Read: false,
		language3Write: false,
		language3Speak: false
	});
	const [masterData, setMasterData] = useState({
		genders: [],
		maritalStatus: [],
		religions: [],
		reservationCategories: [],
		countries: [],
		states: [],
		districts: [],
		cities: [],
		pincodes: [],
		disabilityCategories: [],
		languages: []
	});
	const [candidateProfileId, setCandidateProfileId] = useState(null);

	useEffect(() => {
		const fetchMasterData = async () => {
			const res = await masterApi.getMasterData();
			const data = res?.data?.data;
			setMasterData({
				genders: data.genderMasters || [],
				maritalStatus: data.maritalStatusMaster || [],
				religions: data.religionMaster || [],
				reservationCategories: data.reservationCategories || [],
				countries: data.countries || [],
				states: data.states || [],
				districts: data.districts || [],
				cities: data.cities || [],
				pincodes: data.pincodes || [],
				disabilityCategories: data.disabilityCategories || [],
				languages: data.languageMasters || []
			});
		};
		fetchMasterData();
	}, []);

	useEffect(() => {
		const fetchBasicDetails = async () => {
			try {
				const res = await profileApi.getBasicDetails(candidateId);
				const apiData = res?.data?.data;
				console.log(apiData);
				setCandidateProfileId(apiData?.candidateProfile?.candidateProfileId || null);
				if (!apiData) return;
				const mappedForm = mapBasicDetailsApiToForm(apiData);
				setFormData(prev => ({
					...prev,
					...mappedForm
				}));
			} catch (error) {
				console.error("Failed to fetch basic details", error);
			}
		};
		fetchBasicDetails();
	}, [candidateId]);

	const handleDisabilityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({...formData, disabilityCertificate: file});
  };

	const handleDisabilityBrowse = () => {
		document.getElementById("disabilityCertificate").click();
	};

	const handleServiceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({...formData, serviceCertificate: file});
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

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value
		}));
	};

	const handleRadio = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleCheckbox = (e) => {
		const { id, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: checked
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.isExService) {
			const { isValid, error } = validateEndDateAfterStart(
				formData.serviceEnrollment,
				formData.dischargeDate
			);
			if (!isValid) {
				toast.error(error);
				return;
			}
		}
		const payload = mapBasicDetailsFormToApi({
			formData,
			candidateId,
			createdBy,
			candidateProfileId,
			email
		});
		console.log("BASIC DETAILS PAYLOAD:", payload);
		await profileApi.postBasicDetails(candidateId, payload);
		toast.success("Basic details have been saved successfully")
		goNext();
	};

	const calculateServicePeriodInMonths = (start, end) => {
		if (!start || !end) return "";
		const startDate = new Date(start);
		const endDate = new Date(end);
		if (endDate < startDate) return "";
		let months =
			(endDate.getFullYear() - startDate.getFullYear()) * 12 +
			(endDate.getMonth() - startDate.getMonth());
		// count partial month if end day >= start day
		if (endDate.getDate() >= startDate.getDate()) {
			months += 1;
		}
		return months;
	};

	useEffect(() => {
		if (!formData.isExService) {
			setFormData(prev => ({
				...prev,
				serviceEnrollment: "",
				dischargeDate: "",
				servicePeriod: ""
			}));
			return;
		}
		const months = calculateServicePeriodInMonths(
			formData.serviceEnrollment,
			formData.dischargeDate
		);
		setFormData(prev => ({
			...prev,
			servicePeriod: months
		}));
	}, [formData.serviceEnrollment, formData.dischargeDate, formData.isExService]);

	useEffect(() => {
		if (!formData.isDisabledPerson) {
			setFormData(prev => ({
				...prev,
				disabilityType: "",
				disabilityPercentage: 0,
				scribeRequirement: "",
			}));
			return;
		}
	}, [formData.isDisabledPerson]);

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
						<input type="text" className="form-control" id="firstName" value={formData?.firstName} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="middleName" className="form-label">Middle Name</label>
						<input type="text" className="form-control" id="middleName" value={formData?.middleName} onChange={handleChange} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="lastName" value={formData?.lastName} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullNameAadhar" className="form-label">Full Name as per Aadhar Card <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="fullNameAadhar" value={formData?.fullNameAadhar} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullNameSSC" className="form-label">Full Name as per SSC/Birth certificate <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="fullNameSSC" value={formData?.fullNameSSC} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="gender"
							value={formData.gender}
							onChange={handleChange}
							required
						>
							<option value="">Select Gender</option>
							{masterData?.genders.map(g => (
								<option key={g.genderId} value={g.genderId}>
									{g.gender}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
						<input type="date" className="form-control" id="dob" value={formData?.dob} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="maritalStatus" className="form-label">Marital Status <span className="text-danger">*</span></label>
						<select
							id="maritalStatus"
							value={formData.maritalStatus}
							onChange={handleChange}
							className="form-select"
							required
						>
							<option value="">Select Marital Status</option>
							{masterData?.maritalStatus.map(ms => (
								<option key={ms.maritalStatusId} value={ms.maritalStatusId}>
									{ms.maritalStatus}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="nationality" className="form-label">Nationality/Citizenship <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="nationality"
							value={formData?.nationality}
							onChange={handleChange}
							required
						>
							<option value="">Select Nationality</option>
							{masterData?.countries.map(ms => (
								<option key={ms.countryId} value={ms.countryId}>
									{ms.countryName}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="religion" className="form-label">Religion <span className="text-danger">*</span></label>
						<select
							id="religion"
							value={formData.religion}
							onChange={handleChange}
							className="form-select"
							required
						>
							<option value="">Select Religion</option>
							{masterData?.religions.map(r => (
								<option key={r.religionId} value={r.religionId}>
									{r.religion}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
						<select
							id="category"
							value={formData.category}
							onChange={handleChange}
							className="form-select"
							required
						>
							<option value="">Select Category</option>
							{masterData?.reservationCategories.map(c => (
								<option key={c.reservationCategoriesId} value={c.reservationCategoriesId}>
									{c.categoryName}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="caste" className="form-label">Community/Caste <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="caste" value={formData?.caste} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="casteState" className="form-label">State to which belong for SC/ST/OBC</label>
						<select
							className="form-select"
							id="casteState"
							value={formData?.casteState}
							onChange={handleChange}
						>
							<option value="">Select State</option>
							{masterData?.states.map(c => (
								<option key={c.stateId} value={c.stateId}>
									{c.stateName}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="motherName" className="form-label">Mother Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="motherName" value={formData?.motherName} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fatherName" className="form-label">Father Name <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="fatherName" value={formData?.fatherName} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="spouseName" className="form-label">Spouse Name</label>
						<input type="text" className="form-control" id="spouseName" value={formData?.spouseName} onChange={handleChange} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="contactNumber" className="form-label">Contact Number <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="contactNumber" value={formData?.contactNumber} onChange={handleChange} required />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="altNumber" className="form-label">Alternative Number</label>
						<input type="text" className="form-control" id="altNumber" value={formData?.altNumber} onChange={handleChange} />
					</div>

					{/* <div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="currentCTC" className="form-label">Current CTC (in Lakhs) <span className="text-danger">*</span></label>
						<input type="text" className="form-control" id="currentCTC" />
					</div> */}

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="socialMediaLink" className="form-label">Socail Media Profile Link</label>
						<input type="text" className="form-control" id="socialMediaLink" value={formData?.socialMediaLink} onChange={handleChange} />
					</div>
				</div>

					<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Siblings</p>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="twinSibling" className="form-label">Do you have a twin sibling? <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="twinSibling"
							value={formData?.twinSibling}
							onChange={(e) =>
								setFormData(prev => ({
									...prev,
									twinSibling: e.target.value === "true"
								}))
							}
							required
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="siblingName" className="form-label">Twin Sibling's Name</label>
						<input type="text" className="form-control" id="siblingName" disabled={!formData?.twinSibling} value={formData?.siblingName} onChange={handleChange} required={formData.twinSibling} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="twinGender" className="form-label">Gender of the twin</label>
						<select
							className="form-select"
							id="twinGender"
							value={formData?.twinGender}
							onChange={handleChange}
							disabled={!formData?.twinSibling}
							required={formData.twinSibling}
						>
							<option value="">Select Gender</option>
							{masterData?.genders.map(g => (
								<option key={g.genderId} value={g.genderId}>
									{g.gender}
								</option>
							))}
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
							value={formData?.isDisabledPerson}
							onChange={(e) =>
								setFormData(prev => ({
									...prev,
									isDisabledPerson: e.target.value === "true"
								}))
							}
							required
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="disabilityType" className="form-label">Type of Disability</label>
						<select
							id="disabilityType"
							value={formData.disabilityType}
							onChange={handleChange}
							disabled={!formData.isDisabledPerson}
							className="form-select"
							required={formData.isDisabledPerson}
						>
							<option value="">Select Disability Type</option>
							{masterData?.disabilityCategories.map(d => (
								<option key={d.disabilityCategoryId} value={d.disabilityCategoryId}>
									{d.disabilityName}
								</option>
							))}
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="disabilityPercentage" className="form-label">Disability Percentage</label>
						<div className='d-flex gap-1 align-items-center'>
							<input
								type="number"
								className="form-control"
								id="disabilityPercentage"
								value={formData.disabilityPercentage}
								min={1}
								max={100}
								disabled={!formData.isDisabledPerson}
								required={formData.isDisabledPerson}
								placeholder="1 - 100"
								onChange={(e) => {
									let value = e.target.value;
									if (value === "") {
										setFormData(prev => ({ ...prev, disabilityPercentage: "" }));
										return;
									}
									value = Number(value);
									if (value < 1) value = 1;
									if (value > 100) value = 100;
									setFormData(prev => ({
										...prev,
										disabilityPercentage: value
									}));
								}}
							/>
							<span className="">%</span>
						</div>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="scribeRequirement" className="form-label">Scribe Requirement</label>
						<select
							className="form-select"
							id="scribeRequirement"
							value={formData?.scribeRequirement}
							onChange={handleChange}
							disabled={!formData?.isDisabledPerson}
							required={formData.isDisabledPerson}
						>
							<option value="">Select Scribe Requirement</option>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</div>

					<div className="col-md-6 col-sm-12 mt-2">
						<label htmlFor="disabilityCertificate" className="form-label">Upload Certificate</label>
						{!formData?.disabilityCertificate && (
						<div
							className="border rounded d-flex flex-column align-items-center justify-content-center"
							style={{
								minHeight: "100px",
								cursor: !formData?.isDisabledPerson ? "not-allowed" : "pointer",
								opacity: !formData?.isDisabledPerson ? 0.6 : 1
							}}
							onClick={formData?.isDisabledPerson ? handleDisabilityBrowse : undefined}
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
						{formData?.disabilityCertificate && (
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
											{formData?.disabilityCertificate?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(formData?.disabilityCertificate?.size)}
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
										onClick={() => window.open(URL.createObjectURL(formData?.disabilityCertificate), "_blank")}
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
										onClick={() => setFormData({...formData, disabilityCertificate: null })}
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
							value={formData?.isExService}
							onChange={(e) =>
								setFormData(prev => ({
									...prev,
									isExService: e.target.value === "true"
								}))
							}
							required
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="serviceEnrollment" className="form-label">Service Start Enrollment Date</label>
						<input type="date" className="form-control" id="serviceEnrollment" disabled={!formData?.isExService} value={formData?.serviceEnrollment} onChange={handleChange} required={formData?.isExService} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="dischargeDate" className="form-label">Discharge Date</label>
						<input type="date" className="form-control" id="dischargeDate" disabled={!formData?.isExService} value={formData?.dischargeDate} onChange={handleChange} required={formData?.isExService} min={formData.serviceEnrollment || undefined} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="servicePeriod" className="form-label">Service Period (in Months)</label>
						<input type="number" className="form-control" id="servicePeriod" disabled value={formData?.servicePeriod} onChange={handleChange} />
					</div>
					<div className='col-md-6 d-flex flex-column'>
						<div className="col-md-12 col-sm-12 d-grid">
							<div>
								<label className="form-label">
									Have you already secured regular employment under the Central Govt. in a civil post?
								</label>
							</div>

							<div>
								<input type="radio" id="employmentSecuredYes" name="employmentSecured" value="Yes" checked={formData?.employmentSecured === "Yes"} onChange={handleRadio} />
								<label htmlFor="employmentSecuredYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

								<input type="radio" id="employmentSecuredNo" name="employmentSecured" value="No" checked={formData?.employmentSecured === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
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
								<input type="radio" id="lowerPostYes" name="lowerPostStatus" value="Yes" checked={formData?.lowerPostStatus === "Yes"} onChange={handleRadio} />
								<label htmlFor="lowerPostYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

								<input type="radio" id="lowerPostNo" name="lowerPostStatus" value="No" checked={formData?.lowerPostStatus === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
								<label htmlFor="lowerPostNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
							</div>
						</div>
					</div>
					<div className="col-md-6 col-sm-12 mt-2">
						<label htmlFor="serviceCertificate" className="form-label">Upload Certificate</label>
						{!formData?.serviceCertificate && (
						<div
							className="border rounded d-flex flex-column align-items-center justify-content-center"
							style={{
								minHeight: "100px",
								cursor: !formData?.isExService ? "not-allowed" : "pointer",
								opacity: !formData?.isExService ? 0.6 : 1
							}}
							onClick={formData?.isExService ? handleServiceBrowse : undefined}
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
						{formData?.serviceCertificate && (
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
											{formData?.serviceCertificate?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(formData?.serviceCertificate?.size)}
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
										onClick={() => window.open(URL.createObjectURL(formData?.serviceCertificate), "_blank")}
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
										onClick={() => setFormData({...formData, serviceCertificate: null })}
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
						id="language1"
						value={formData.language1}
						onChange={handleChange}
						className="form-select"
						required
					>
						<option value="">Select Language 1</option>
						{masterData?.languages.map(l => (
							<option key={l.languageId} value={l.languageId}>
								{l.languageName}
							</option>
						))}
					</select>
					<div className="d-flex">
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language1Read" checked={formData?.language1Read} onChange={handleCheckbox} />
							<label htmlFor="read1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language1Write" checked={formData?.language1Write} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language1Speak" checked={formData?.language1Speak} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="speak1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Speak</label>
						</div>
					</div>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="language2" className="form-label">Language 2</label>
					<select
						id="language2"
						value={formData.language2}
						onChange={handleChange}
						className="form-select"
					>
						<option value="">Select Language 2</option>
						{masterData?.languages.map(l => (
							<option key={l.languageId} value={l.languageId}>
								{l.languageName}
							</option>
						))}
					</select>
					<div className="d-flex">
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language2Read" checked={formData?.language2Read} onChange={handleCheckbox} />
							<label htmlFor="read2" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language2Write" checked={formData?.language2Write} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="write2" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language2Speak" checked={formData?.language2Speak} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="speak2" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Speak</label>
						</div>
					</div>
				</div>

				<div className="col-md-4 col-sm-12 mt-2">
					<label htmlFor="language3" className="form-label">Language 3</label>
					<select
						id="language3"
						value={formData.language3}
						onChange={handleChange}
						className="form-select"
					>
						<option value="">Select Language 3</option>
						{masterData?.languages.map(l => (
							<option key={l.languageId} value={l.languageId}>
								{l.languageName}
							</option>
						))}
					</select>
					<div className="d-flex">
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language3Read" checked={formData?.language3Read} onChange={handleCheckbox} />
							<label htmlFor="read1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language3Write" checked={formData?.language3Write} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }}/>
							<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
						</div>
						<div className="d-flex align-items-center">
							<input type="checkbox" id="language3Speak" checked={formData?.language3Speak} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }}/>
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
						<input type="radio" id="riotVictimFamily" name="riotVictimFamily" value="Yes" checked={formData?.riotVictimFamily === "Yes"} onChange={handleRadio} />
						<label htmlFor="riotYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="riotVictimFamily" name="riotVictimFamily" value="No" checked={formData?.riotVictimFamily === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
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
						<input type="radio" id="servingInGovt" name="servingInGovt" value="Yes" checked={formData?.servingInGovt === "Yes"} onChange={handleRadio} />
						<label htmlFor="psuYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="servingInGovt" name="servingInGovt" value="No"  checked={formData?.servingInGovt === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
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
						<input type="radio" id="minorityCommunity" name="minorityCommunity" value="Yes" checked={formData?.minorityCommunity === "Yes"} onChange={handleRadio} />
						<label htmlFor="rmcYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="minorityCommunity" name="minorityCommunity" value="No" checked={formData?.minorityCommunity === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
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
						<input type="radio" id="disciplinaryAction" name="disciplinaryAction" value="Yes" checked={formData?.disciplinaryAction === "Yes"} onChange={handleRadio} />
						<label htmlFor="disciplineActionYes" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>Yes</label>

						<input type="radio" id="disciplinaryAction" name="disciplinaryAction" value="No" checked={formData?.disciplinaryAction === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
						<label htmlFor="disciplineActionNo" style={{ fontSize: "12px", marginLeft: "0.25rem" }}>No</label>
					</div>
				</div>

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
			</div>

			</form>
		</div>
  )
}

export default BasicDetails