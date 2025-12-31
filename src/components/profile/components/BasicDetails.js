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
import { validateEndDateAfterStart, validateNonEmptyText } from '../../../shared/utils/validation';

const normalizeName = (name = "") =>
	name
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();

const normalizeDate = (date = "") => {
	// Aadhaar OCR: DD/MM/YYYY
	// Form input: YYYY-MM-DD
	if (!date) return "";

	if (date.includes("/")) {
		const [dd, mm, yyyy] = date.split("/");
		return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
	}
	return date;
};

const BasicDetails = ({ goNext, goBack }) => {

	const [formErrors, setFormErrors] = useState({});
	const aadhaarName = useSelector(state => state.idProof.name);
	const aadhaarDob = useSelector(state => state.idProof.dob);
	console.log("AADHAAR FROM REDUX:", aadhaarName);

	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;
	const email = user?.user?.email
	const createdBy = user?.user?.id;
	// const email = "sumanthsangam2@gmail.com"
	// const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	// const createdBy = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	const communityDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "COMMUNITY_CERT"));
	const disabilityDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "DISABILITY"));
	const serviceDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "SERVICE"));
	const birthDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "BIRTH_CERT"));
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
		communityCertificate: null,
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
		disabilities: [],
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
		language3Speak: false,

		registrationNo: ""
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

	const [communityFile, setCommunityFile] = useState(null);
	const [existingCommunityDoc, setExistingCommunityDoc] = useState(null);
	const [disabilityFile, setDisabilityFile] = useState(null);
	const [existingDisabilityDoc, setExistingDisabilityDoc] = useState(null);
	const [serviceFile, setServiceFile] = useState(null);
	const [existingServiceDoc, setExistingServiceDoc] = useState(null);
	const [birthFile, setBirthFile] = useState(null);
	const [existingBirthDoc, setExistingBirthDoc] = useState(null);
	const [touched, setTouched] = useState({
		fullNameAadhar: false,
		dob: false
	});

	const isNameMismatch =
		touched.fullNameAadhar &&
		aadhaarName &&
		normalizeName(formData.fullNameAadhar) !== normalizeName(aadhaarName);


	const isDobMismatch =
		touched.dob &&
		aadhaarDob &&
		normalizeDate(formData.dob) !== normalizeDate(aadhaarDob);

	const isNewAadhaarUpload = useSelector(
		state => state.idProof?.isNewUpload

	);
	console.log("IS NEW UPLOAD:", isNewAadhaarUpload);


	const [isAadhaarLocked, setIsAadhaarLocked] = useState(false);




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
					...mappedForm,
					// 👇 OCR overrides DB ONLY if new Aadhaar uploaded
					fullNameAadhar: isNewAadhaarUpload
						? aadhaarName
						: mappedForm.fullNameAadhar
				}));
				console.log("Mapped Form Data:", mappedForm);

				setIsAadhaarLocked(
					Boolean(isNewAadhaarUpload || mappedForm.fullNameAadhar)
				);

			} catch (error) {
				console.error("Failed to fetch basic details", error);
			}
		};
		fetchBasicDetails();
	}, [candidateId]);
	useEffect(() => {
		if (!aadhaarName || !isNewAadhaarUpload) return;

		setFormData(prev => ({
			...prev,
			fullNameAadhar: aadhaarName
		}));

		setIsAadhaarLocked(true);
	}, [aadhaarName, isNewAadhaarUpload]);


	useEffect(() => {
		if (!candidateId || !communityDoc?.docCode) return;

		profileApi
			.getDocumentDetailsByCode(candidateId, communityDoc.docCode)
			.then(res => setExistingCommunityDoc(res?.data?.data || null))
			.catch(console.error);
	}, [candidateId, communityDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !birthDoc?.docCode) return;

		profileApi
			.getDocumentDetailsByCode(candidateId, birthDoc.docCode)
			.then(res => {
				setExistingBirthDoc(res?.data?.data || null);
			})
			.catch(err => {
				console.error("Birth cert fetch failed", err);
			});
	}, [candidateId, birthDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !disabilityDoc?.docCode) return;

		profileApi
			.getDocumentDetailsByCode(candidateId, disabilityDoc.docCode)
			.then(res => {
				setExistingDisabilityDoc(res?.data?.data || null);
			})
			.catch(err => {
				console.error("Disability Certificate fetch failed", err);
			});
	}, [candidateId, disabilityDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !serviceDoc?.docCode) return;

		profileApi
			.getDocumentDetailsByCode(candidateId, serviceDoc.docCode)
			.then(res => {
				setExistingServiceDoc(res?.data?.data || null);
			})
			.catch(err => {
				console.error("Service Certificate fetch failed", err);
			});
	}, [candidateId, serviceDoc?.docCode]);

	const selectedCategory = masterData?.reservationCategories?.find(
		c => c.reservationCategoriesId === formData?.category
	);

	const isGeneralCategory = selectedCategory?.categoryCode === "GEN";
	useEffect(() => {
		if (isGeneralCategory) {
			setFormData(prev => ({
				...prev,
				casteState: ""
			}));

			setCommunityFile(null);
			setExistingCommunityDoc(null);
		}
	}, [isGeneralCategory]);

	const getAvailableLanguages = (excludeIds = []) => {
		return masterData.languages.filter(
			l => !excludeIds.includes(l.languageId)
		);
	};
	useEffect(() => {
		if (
			formData.language1 &&
			formData.language1 === formData.language2
		) {
			setFormData(prev => ({ ...prev, language2: "" }));
		}

		if (
			formData.language1 &&
			formData.language1 === formData.language3
		) {
			setFormData(prev => ({ ...prev, language3: "" }));
		}
	}, [formData.language1]);



	const handleCommunityFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error("File size must be under 2MB");
			input.value = "";
			return;
		}
		const validateresoponse = await validateDoc("COMMUNITY_CERT", file);
		if (!validateresoponse || validateresoponse?.data?.success === false) {
			toast.error(validateresoponse?.data?.message || "Invalid Community Certificate");
			input.value = "";
			return;
		}
		setCommunityFile(file);
		input.value = "";
	};
	const handleCommunityBrowse = () => {
		document.getElementById("communityCertificate").click();
	};

	const handleDisabilityFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error("File size must be under 2MB");
			input.value = "";
			return;
		}
		const validateresoponse = await validateDoc("DISABILITY", file);
		if (!validateresoponse || validateresoponse?.data?.success === false) {
			toast.error(validateresoponse?.data?.message || "Invalid Disability Certificate");
			input.value = "";
			return;
		}

		setDisabilityFile(file);
		input.value = "";
	};

	const handleDisabilityBrowse = () => {
		document.getElementById("disabilityCertificate").click();
	};

	const handleServiceFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				toast.error("File size must be under 2MB");
				return;
			}
			setServiceFile(file);
		}
	};

	const handleServiceBrowse = () => {
		document.getElementById("serviceCertificate").click();
	};

	const handleBirthFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			toast.error("File size must be under 2MB");
			input.value = "";
			return;
		}
		const validateresoponse = await validateDoc("BIRTH_CERT", file);
		if (!validateresoponse || validateresoponse?.data?.success === false) {
			toast.error(validateresoponse?.data?.message || "Invalid Birth Certificate");
			input.value = "";
			return;
		}

		setBirthFile(file);
		// Clear input so selecting the same file again triggers onChange
		input.value = "";
	};
	const validateDoc = async (documentName, file) => {
		try {
			const res = await profileApi.ValidateDocument(documentName, file);
			return res;
		} catch (err) {
			return false;
		}
	}
	const handleBirthBrowse = () => {
		document.getElementById("birthCertificate").click();
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
		setFormErrors(prev => ({
			...prev,
			[id]: ""
		}));
		if (id === "fullNameAadhar" || id === "dob") {
			setTouched(prev => ({
				...prev,
				[id]: true
			}));
		}
	};

	const handleDisabilityChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			disabilities: prev.disabilities.map((dis, i) =>
				i === index ? { ...dis, [field]: value } : dis
			)
		}));
	};

	const addDisability = () => {
		const lastDis = formData.disabilities[formData.disabilities.length - 1];
		const newDis = lastDis ? { ...lastDis } : { disabilityCategoryId: "", disabilityPercentage: "" };
		setFormData(prev => ({
			...prev,
			disabilities: [...prev.disabilities, newDis]
		}));
	};

	const removeDisability = (index) => {
		setFormData(prev => ({
			...prev,
			disabilities: prev.disabilities.filter((_, i) => i !== index)
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
		const errors = {};

		// Required fields validation
		const requiredFields = [
			'firstName', 'lastName', 'fullNameAadhar', 'fullNameSSC', 'gender',
			'dob', 'maritalStatus', 'nationality', 'religion', 'category',
			'caste', 'motherName', 'fatherName', 'contactNumber', 'language1'
		];

		// Check required fields
		requiredFields.forEach(field => {
			if (!formData[field]?.toString().trim()) {
				errors[field] = "This field is required";
			}
		});

		// Twin sibling validation
		if (formData.twinSibling && !formData.siblingName?.trim()) {
			errors.siblingName = "Please add twin sibling's name";
		}
if (formData.twinSibling && !formData.twinGender) {
			errors.twinGender = "This field is required";
		}


		// Disability validations
		if (formData.isDisabledPerson) {
			if (formData.disabilities.length === 0) {
				errors.disabilities = "This field is required";
			} else {
				formData.disabilities.forEach((dis, index) => {
					if (!dis.disabilityCategoryId) {
						errors[`disabilityType_${index}`] = "This field is required";
					}
					if (!dis.disabilityPercentage) {
						errors[`disabilityPercentage_${index}`] = "This field is required";
					}
				});
			}


			if (formData.scribeRequirement === undefined) {
				errors.scribeRequirement = "This field is required";
			}

			if (!disabilityFile && !existingDisabilityDoc) {
				errors.disabilityCertificate = "This field is required";
			}
		}

		// Ex-service validations
		if (formData.isExService) {
			if (!formData.serviceEnrollment) {
				errors.serviceEnrollment = "This field is required";
			}
			if (!formData.dischargeDate) {
				errors.dischargeDate = "This field is required";
			}
			if (formData.serviceEnrollment && formData.dischargeDate) {
				const { isValid, error } = validateEndDateAfterStart(
					formData.serviceEnrollment,
					formData.dischargeDate
				);
				if (!isValid) {
					errors.dischargeDate = error;
				}
			}

			if (!serviceFile && !existingServiceDoc) {
				errors.serviceCertificate = "This field is required";
			}
		}

		// Document validations
		if (!isGeneralCategory && !communityFile && !existingCommunityDoc) {
			errors.communityCertificate = "This field is required";
		}

		if (!birthFile && !existingBirthDoc) {
			errors.birthCertificate = "This field is required";
		}



		// If there are errors, set them and return
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			const firstError = Object.keys(errors)[0];
			document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth' });
			return;
		}

		// Rest of your form submission logic...
		try {
			const payload = mapBasicDetailsFormToApi({
				formData,
				candidateId,
				createdBy,
				candidateProfileId,
				email,
			});

			await profileApi.postBasicDetails(candidateId, payload);

			// Handle file uploads...
			const uploadPromises = [];
			if (communityFile) {
				uploadPromises.push(profileApi.postDocumentDetails(candidateId, communityDoc.documentTypeId, communityFile));
			}
			if (birthFile) {
				uploadPromises.push(profileApi.postDocumentDetails(candidateId, birthDoc.documentTypeId, birthFile));
			}
			if (disabilityFile && formData.isDisabledPerson) {
				uploadPromises.push(profileApi.postDocumentDetails(candidateId, disabilityDoc.documentTypeId, disabilityFile));
			}
			if (serviceFile && formData.isExService) {
				uploadPromises.push(profileApi.postDocumentDetails(candidateId, serviceDoc.documentTypeId, serviceFile));
			}
			await Promise.all(uploadPromises);

			toast.success("Basic details have been saved successfully");
			goNext();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save basic details");
		}
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

	// when OCR/extracted data arrives, populate form and lock fullNameAadhar
	useEffect(() => {
		if (!aadhaarName) return;

		setFormData(prev => ({
			...prev,
			fullNameAadhar: aadhaarName
		}));

		setFormErrors(prev => ({
			...prev,
			fullNameAadhar: ""
		}));

		setTouched(prev => ({
			...prev,
			fullNameAadhar: true
		}));
	}, [aadhaarName]);

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
						<input
							type="text"
							className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
							id="firstName"
							value={formData.firstName || ''}
							onChange={handleChange}
						/>
						{formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
					</div>
					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="middleName" className="form-label">Middle Name</label>
						<input type="text" className="form-control" id="middleName" value={formData?.middleName} onChange={handleChange} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
						<input type="text" className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`} id="lastName" value={formData?.lastName} onChange={handleChange} />
						{formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullNameAadhar" className="form-label">Full Name as per Aadhar Card <span className="text-danger">*</span></label>
						<input
							type="text"
							id="fullNameAadhar"
							value={formData.fullNameAadhar}
							readOnly={isAadhaarLocked}
							className={`form-control ${isAadhaarLocked ? "bg-light text-muted" : ""}`}
						/>




						{isNameMismatch && (
							<small className="text-danger">
								Name not matching with Aadhaar
							</small>
						)}
						{formErrors.fullNameAadhar && <div className="invalid-feedback">{formErrors.fullNameAadhar}</div>}

					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fullNameSSC" className="form-label">Full Name as per SSC/Birth certificate <span className="text-danger">*</span></label>
						<input type="text" className={`form-control ${formErrors.fullNameSSC ? 'is-invalid' : ''}`} id="fullNameSSC" value={formData?.fullNameSSC} onChange={handleChange} />
						{formErrors.fullNameSSC && <div className="invalid-feedback">{formErrors.fullNameSSC}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
						<select
							className={`form-select ${formErrors.gender ? 'is-invalid' : ''}`}
							id="gender"
							value={formData.gender}
							onChange={handleChange}

						>
							<option value="">Select Gender</option>
							{masterData?.genders.map(g => (
								<option key={g.genderId} value={g.genderId}>
									{g.gender}
								</option>
							))}
						</select>
						{formErrors.gender && <div className="invalid-feedback">{formErrors.gender}</div>}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
						<input type="date" className={`form-control ${formErrors.dob ? 'is-invalid' : ''}`} id="dob" value={formData?.dob} onChange={handleChange} />

						{isDobMismatch && (
							<small className="text-danger">
								Date of Birth not matching with Aadhaar
							</small>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="birthCertificate" className="form-label">Upload Birth Certificate <span className="text-danger">*</span></label>
						{!birthFile && !existingBirthDoc && (
							<div
								className={`border rounded d-flex flex-column align-items-center justify-content-center
    ${formErrors.birthCertificate ? "border-danger" : ""}`}
								style={{
									minHeight: "100px",
									cursor: "pointer",
									opacity: 1
								}}
								onClick={handleBirthBrowse}
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
									id="birthCertificate"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									style={{ display: "none" }}
									onChange={handleBirthFileChange}
								/>
							</div>
						)}

						{existingBirthDoc && !birthFile && (
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
											{existingBirthDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(certificateFile.size)}
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
										onClick={() => window.open(existingBirthDoc.fileUrl, "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									{/* <img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={handleBrowse}
									/> */}

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => {
											if (existingBirthDoc?.documentId) {
												profileApi.deleteDocument(candidateId, existingBirthDoc.documentId).then(() => {
													setExistingBirthDoc(null);
												}).catch(err => {
													console.error("Failed to delete", err);
													toast.error("Failed to delete document");
												});
											}
										}}
									/>

								</div>
							</div>
						)}

						{birthFile && (
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
											{birthFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(birthFile.size)}
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
										onClick={() => window.open(URL.createObjectURL(birthFile), "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									<img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={handleBirthBrowse}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setBirthFile(null)}
									/>

								</div>
							</div>
						)}
						{formErrors.birthCertificate && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.birthCertificate}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="maritalStatus" className="form-label">Marital Status <span className="text-danger">*</span></label>
						<select
							id="maritalStatus"
							value={formData.maritalStatus}
							onChange={handleChange}
							className={`form-select ${formErrors.maritalStatus ? 'is-invalid' : ''}`}

						>
							<option value="">Select Marital Status</option>
							{masterData?.maritalStatus.map(ms => (
								<option key={ms.maritalStatusId} value={ms.maritalStatusId}>
									{ms.maritalStatus}
								</option>
							))}
						</select>
						{formErrors.maritalStatus && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.maritalStatus}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="motherName" className="form-label">Mother Name <span className="text-danger">*</span></label>
						<input type="text" className={`form-control ${formErrors.motherName ? 'is-invalid' : ''}`} id="motherName" value={formData?.motherName} onChange={handleChange} />
						{formErrors.motherName && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.motherName}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="fatherName" className="form-label">Father Name <span className="text-danger">*</span></label>
						<input type="text" className={`form-control ${formErrors.fatherName ? 'is-invalid' : ''}`} id="fatherName" value={formData?.fatherName} onChange={handleChange} />
						{formErrors.fatherName && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.fatherName}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="spouseName" className="form-label">Spouse Name</label>
						<input type="text" className="form-control" id="spouseName" value={formData?.spouseName} onChange={handleChange} />
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="contactNumber" className="form-label">Contact Number <span className="text-danger">*</span></label>
						<input type="text" className={`form-control ${formErrors.contactNumber ? 'is-invalid' : ''}`} id="contactNumber" value={formData?.contactNumber} onChange={handleChange} />
						{formErrors.contactNumber && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.contactNumber}
							</div>
						)}
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
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Commuity</p>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="nationality" className="form-label">Nationality/Citizenship <span className="text-danger">*</span></label>
						<select
							className={`form-select ${formErrors.nationality ? 'is-invalid' : ''}`}
							id="nationality"
							value={formData?.nationality}
							onChange={handleChange}

						>
							<option value="">Select Nationality</option>
							{masterData?.countries.map(ms => (
								<option key={ms.countryId} value={ms.countryId}>
									{ms.countryName}
								</option>
							))}
						</select>
						{formErrors.nationality && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.nationality}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="religion" className="form-label">Religion <span className="text-danger">*</span></label>
						<select
							id="religion"
							value={formData.religion}
							onChange={handleChange}
							className={`form-select ${formErrors.religion ? 'is-invalid' : ''}`}

						>
							<option value="">Select Religion</option>
							{masterData?.religions.map(r => (
								<option key={r.religionId} value={r.religionId}>
									{r.religion}
								</option>
							))}
						</select>
						{formErrors.religion && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.religion}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
						<select
							id="category"
							value={formData.category}
							onChange={handleChange}
							className={`form-select ${formErrors.category ? 'is-invalid' : ''}`}

						>
							<option value="">Select Category</option>
							{masterData?.reservationCategories.map(c => (
								<option key={c.reservationCategoriesId} value={c.reservationCategoriesId}>
									{c.categoryName}
								</option>
							))}
						</select>
						{formErrors.category && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.category}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="caste" className="form-label">Community/Caste <span className="text-danger">*</span></label>
						<input type="text" className={`form-control ${formErrors.caste ? 'is-invalid' : ''}`} id="caste" value={formData?.caste} onChange={handleChange} />
						{formErrors.caste && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.caste}
							</div>
						)}
					</div>

					<div className="col-md-3 col-sm-12 mt-2">
						<label htmlFor="casteState" className="form-label">State to which belong for SC/ST/OBC</label>
						<select
							className="form-select"
							id="casteState"
							value={formData?.casteState}
							onChange={handleChange}
							disabled={isGeneralCategory}
						>
							<option value="">Select State</option>
							{masterData?.states.map(c => (
								<option key={c.stateId} value={c.stateId}>
									{c.stateName}
								</option>
							))}
						</select>

					</div>

					<div className="col-md-6 col-sm-12 mt-2">
						<label htmlFor="communityCertificate" className="form-label">
							Upload Certificate
							{!isGeneralCategory && <span className="text-danger">*</span>}
						</label>
						{!communityFile && !existingCommunityDoc && (
							<div
								className={`border rounded d-flex flex-column align-items-center justify-content-center
    ${formErrors.communityCertificate ? "border-danger" : ""}`} style={{
									minHeight: "100px",
									cursor: isGeneralCategory ? "not-allowed" : "pointer",
									opacity: isGeneralCategory ? 0.6 : 1
								}}
								onClick={!isGeneralCategory ? handleCommunityBrowse : undefined}
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
									id="communityCertificate"
									type="file"
									accept=".jpg,.jpeg,.png,.pdf"
									style={{ display: "none" }}
									onChange={handleCommunityFileChange}
								/>
							</div>
						)}

						{existingCommunityDoc && !communityFile && (
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
											{existingCommunityDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(certificateFile.size)}
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
										onClick={() => window.open(existingCommunityDoc.fileUrl, "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									{/* <img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={handleBrowse}
									/> */}

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => {
											if (existingCommunityDoc?.documentId) {
												profileApi.deleteDocument(candidateId, existingCommunityDoc.documentId).then(() => {
													setExistingCommunityDoc(null);
												}).catch(err => {
													console.error("Failed to delete", err);
													toast.error("Failed to delete document");
												});
											}
										}}
									/>

								</div>
							</div>
						)}

						{communityFile && (
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
											{communityFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(communityFile.size)}
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
										onClick={() => window.open(URL.createObjectURL(communityFile), "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									<img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={handleCommunityBrowse}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setCommunityFile(null)}
									/>

								</div>
							</div>
						)}
						{formErrors.communityCertificate && (
							<div className="text-danger mt-1" style={{ fontSize: "12px" }}>
								{formErrors.communityCertificate}
							</div>
						)}
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
						<input
							type="text"
							className={`form-control ${formErrors.siblingName ? 'is-invalid' : ''}`}
							id="siblingName"
							disabled={!formData?.twinSibling}
							value={formData?.siblingName}
							onChange={handleChange}
						/>
						{formErrors.siblingName && <div className="invalid-feedback">{formErrors.siblingName}</div>}
					</div>

					 <div className="col-md-3 col-sm-12 mt-2">
                        <label htmlFor="twinGender" className="form-label">Gender of the twin</label>
                        <select
                            className={`form-select ${formErrors.twinGender ? 'is-invalid' : ''}`}
                            id="twinGender"
                            value={formData?.twinGender}
                            onChange={handleChange}
                            disabled={!formData?.twinSibling}
                        >
                            <option value="">Select Gender</option>
                            {masterData?.genders.map(g => (
                                <option key={g.genderId} value={g.genderId}>
                                    {g.gender}
                                </option>
                            ))}
                        </select>
                        {formErrors.twinGender && <div className="invalid-feedback">{formErrors.twinGender}</div>}
                    </div>
				</div>

				<div className="px-4 pb-4 rounded row g-4 formfields bg-white border">
					<p className="tab_headers" style={{ marginBottom: '0px', marginTop: '1rem' }}>Disability</p>

					<div className="col-md-4 col-sm-12 mt-2">
						<label htmlFor="disability" className="form-label">Person with Disability? <span className="text-danger">*</span></label>
						<select
							className="form-select"
							id="disability"
							value={formData?.isDisabledPerson}
							onChange={(e) => {
								const isDisabled = e.target.value === "true";
								setFormData(prev => ({
									...prev,
									isDisabledPerson: isDisabled,
									disabilities: isDisabled ? (prev.disabilities.length > 0 ? prev.disabilities : [{ disabilityCategoryId: "", disabilityPercentage: "" }]) : []
								}));
							}}
							required
						>
							<option value={true}>Yes</option>
							<option value={false}>No</option>
						</select>
					</div>

					<div className="col-md-4 col-sm-12 mt-2">
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

					<div className="col-md-4 col-sm-12 mt-2">
						<label htmlFor="disabilityCertificate" className="form-label">Upload Certificate</label>
						{!disabilityFile && !existingDisabilityDoc && (
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
						{existingDisabilityDoc && !disabilityFile && (
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
											{existingDisabilityDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
										{formatFileSize(certificateFile.size)}
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
										onClick={() => window.open(existingDisabilityDoc.fileUrl, "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									{/* <img
									src={editIcon}
									alt="Edit"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={handleBrowse}
								/> */}

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => {
											if (existingDisabilityDoc?.documentId) {
												profileApi.deleteDocument(candidateId, existingDisabilityDoc.documentId).then(() => {
													setExistingDisabilityDoc(null);
												}).catch(err => {
													console.error("Failed to delete", err);
													toast.error("Failed to delete document");
												});
											}
										}}
									/>

								</div>
							</div>
						)}

						{disabilityFile && (
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
											{disabilityFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(disabilityFile.size)}
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
										onClick={() => window.open(URL.createObjectURL(disabilityFile), "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									<img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={handleDisabilityBrowse}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setDisabilityFile(null)}
									/>

								</div>
							</div>
						)}
					</div>

					<div className="d-flex justify-content-end mt-2">
						<button
							type="button"
							className="btn btn-primary mt-3"
							style={{
								backgroundColor: "#ff7043",
								border: "none",
								padding: "0.25rem 1rem",
								borderRadius: "4px",
								color: "#fff",
								fontSize: '0.875rem'
							}}
							onClick={addDisability}
							disabled={!formData.isDisabledPerson}
						>
							+ Add Disability
						</button>
					</div>

					{formData.disabilities.map((dis, index) => (
						<div key={index} className='border rounded d-flex pb-3 px-4 gap-3'>
							<div className="col-md-6 col-sm-12 mt-2">
								<label htmlFor={`disabilityType-${index}`} className="form-label">Type of Disability</label>
								<select
									id={`disabilityType-${index}`}
									value={dis.disabilityCategoryId}
									onChange={(e) => handleDisabilityChange(index, 'disabilityCategoryId', e.target.value)}
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

							<div className="col-md-5 col-sm-12 mt-2">
								<label htmlFor={`disabilityPercentage-${index}`} className="form-label">Disability Percentage</label>
								<div className='d-flex gap-1 align-items-center'>
									<input
										type="number"
										className="form-control"
										id={`disabilityPercentage-${index}`}
										value={dis.disabilityPercentage}
										min={1}
										max={100}
										disabled={!formData.isDisabledPerson}
										required={formData.isDisabledPerson}
										placeholder="1 - 100"
										onChange={(e) => {
											let value = e.target.value;
											if (value === "") {
												handleDisabilityChange(index, 'disabilityPercentage', "");
												return;
											}
											value = Number(value);
											if (value < 1) value = 1;
											if (value > 100) value = 100;
											handleDisabilityChange(index, 'disabilityPercentage', value);
										}}
									/>
									<span className="">%</span>
								</div>
							</div>

							{formData.disabilities.length > 1 && (
								<div className="col-md-2 col-sm-12 d-flex align-items-end">
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => removeDisability(index)}
									/>
								</div>
							)}
						</div>
					))}

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
					<div className="col-md-6 col-sm-12 mt-4">
						<label htmlFor="serviceCertificate" className="form-label">Upload Certificate</label>
						{!serviceFile && !existingServiceDoc && (
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
						{existingServiceDoc && !serviceFile && (
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
											{existingServiceDoc.fileName}
										</div>
										{/* <div className="text-muted" style={{ fontSize: "12px" }}>
										{formatFileSize(certificateFile.size)}
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
										onClick={() => window.open(existingServiceDoc.fileUrl, "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									{/* <img
									src={editIcon}
									alt="Edit"
									style={{ width: "25px", cursor: "pointer" }}
									onClick={handleBrowse}
								/> */}

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => {
											if (existingServiceDoc?.documentId) {
												profileApi.deleteDocument(candidateId, existingServiceDoc.documentId).then(() => {
													setExistingServiceDoc(null);
												}).catch(err => {
													console.error("Failed to delete", err);
													toast.error("Failed to delete document");
												});
											}
										}}
									/>

								</div>
							</div>
						)}

						{serviceFile && (
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
											{serviceFile?.name}
										</div>
										<div className="text-muted" style={{ fontSize: "12px" }}>
											{formatFileSize(serviceFile.size)}
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
										onClick={() => window.open(URL.createObjectURL(serviceFile), "_blank")}
									/>

									{/* Edit → triggers file re-upload */}
									<img
										src={editIcon}
										alt="Edit"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={handleServiceBrowse}
									/>

									{/* Delete */}
									<img
										src={deleteIcon}
										alt="Delete"
										style={{ width: "25px", cursor: "pointer" }}
										onClick={() => setServiceFile(null)}
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
							className={`form-select ${formErrors.language1 ? "is-invalid" : ""}`}

						>
							<option value="">Select Language 1</option>

							{getAvailableLanguages([
								formData.language2,
								formData.language3
							]).map(l => (
								<option key={l.languageId} value={l.languageId}>
									{l.languageName}
								</option>
							))}
						</select>
						{formErrors.language1 && <div className="invalid-feedback">{formErrors.language1}</div>}

						<div className="d-flex">
							<div className="d-flex align-items-center">
								<input type="checkbox" id="language1Read" checked={formData?.language1Read} onChange={handleCheckbox} />
								<label htmlFor="read1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Read</label>
							</div>
							<div className="d-flex align-items-center">
								<input type="checkbox" id="language1Write" checked={formData?.language1Write} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }} />
								<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
							</div>
							<div className="d-flex align-items-center">
								<input type="checkbox" id="language1Speak" checked={formData?.language1Speak} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }} />
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

							{getAvailableLanguages([
								formData.language1,
								formData.language3
							]).map(l => (
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
								<input type="checkbox" id="language2Write" checked={formData?.language2Write} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }} />
								<label htmlFor="write2" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
							</div>
							<div className="d-flex align-items-center">
								<input type="checkbox" id="language2Speak" checked={formData?.language2Speak} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }} />
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

							{getAvailableLanguages([
								formData.language1,
								formData.language2
							]).map(l => (
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
								<input type="checkbox" id="language3Write" checked={formData?.language3Write} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }} />
								<label htmlFor="write1" className="form-label" style={{ marginLeft: '0.25rem', marginTop: '0.4rem' }}>Write</label>
							</div>
							<div className="d-flex align-items-center">
								<input type="checkbox" id="language3Speak" checked={formData?.language3Speak} onChange={handleCheckbox} style={{ marginLeft: '0.75rem' }} />
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

							<input type="radio" id="servingInGovt" name="servingInGovt" value="No" checked={formData?.servingInGovt === "No"} onChange={handleRadio} style={{ marginLeft: '1rem' }} />
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

			</form >
		</div >
	)
}

export default BasicDetails