import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import profileApi from '../services/profile.api';
import { mapBasicDetailsApiToForm, mapBasicDetailsFormToApi } from '../mappers/BasicMapper';
import masterApi from '../../../services/master.api';
import { toast } from 'react-toastify';
import { isAllowedNameChar, isValidName, sanitizeName, validateEndDateAfterStart, validateFile, validateNonEmptyText } from '../../../shared/utils/validation';

const normalizeName = (name = "") =>
	name
		// .toLowerCase()
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

export const useBasicDetails = ({ goNext, goBack, parsedData }) => {
	const [formErrors, setFormErrors] = useState({});
	const aadhaarName = useSelector(state => state.idProof.name);
	const aadhaarDob = useSelector(state => state.idProof.dob);
	console.log("AADHAAR FROM REDUX:", aadhaarName);

	const user = useSelector((state) => state?.user?.user?.data);
	const candidateId = user?.user?.id;
	const email = user?.user?.email;
	const createdBy = user?.user?.id;
	// const email = "sumanthsangam2@gmail.com"
	// const candidateId = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	// const createdBy = "70721aa9-0b00-4f34-bea2-3bf268f1c212";
	const communityDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "COMMUNITY_CERT"));
	const disabilityDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "DISABILITY"));
	const serviceDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "SERVICE"));
	const birthDoc = useSelector((state) => state.documentTypes?.list?.data?.find(doc => doc.docCode === "BIRTH_CERT"));
	const [loading, setLoading] = useState(false);
	const [isDirty, setIsDirty] = useState(false);
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
		cibilScore: "",
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
		employmentSecured: "No",
		lowerPostStatus: "No",
		serviceCertificate: null,

		riotVictimFamily: "No",
		servingInGovt: "No",
		minorityCommunity: "No",
		disciplinaryAction: "No",

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
	const [parsedFields, setParsedFields] = useState({});
	const NAME_FIELDS = new Set([
		"firstName",
		"middleName",
		"lastName",
		"fullNameSSC",
		"motherName",
		"fatherName",
		"spouseName",
		"siblingName",
		"caste"
	]);

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

	const getAvailableDisabilityTypes = (currentIndex) => {
		const selectedIds = formData.disabilities
			.filter((_, i) => i !== currentIndex)
			.map(d => d.disabilityCategoryId)
			.filter(Boolean);

		return masterData.disabilityCategories.filter(
			d => !selectedIds.includes(d.disabilityCategoryId)
		);
	};

	useEffect(() => {
		const fetchMasterData = async () => {
			setLoading(true);
			try {
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
			} catch (error) {
				console.error("Failed to fetch master data", error);
			} finally {
				setLoading(false);
			}
		};
		fetchMasterData();
	}, []);

	useEffect(() => {
		const fetchBasicDetails = async () => {
			setLoading(true);
			try {
				const res = await profileApi.getBasicDetails(candidateId);
				const apiData = res?.data;
				console.log(apiData);
				setCandidateProfileId(apiData?.candidateProfile?.candidateProfileId || null);
				if (!apiData) return;
				const mappedForm = mapBasicDetailsApiToForm(apiData);

				setFormData(prev => ({
					...prev,
					...mappedForm,
					firstName: prev.firstName || mappedForm.firstName,
					middleName: prev.middleName || mappedForm.middleName,
					lastName: prev.lastName || mappedForm.lastName,
					// 👇 Use extracted Aadhaar name if available, else DB data
					fullNameAadhar: aadhaarName || mappedForm.fullNameAadhar
				}));
				setIsDirty(false);
				console.log("Mapped Form Data:", mappedForm);

				setIsAadhaarLocked(
					Boolean(aadhaarName || mappedForm.fullNameAadhar)
				);

				setParsedFields(prev => {
					const updated = { ...prev };

					["firstName", "middleName", "lastName"].forEach(k => {
						if (mappedForm[k] && formData[k] === mappedForm[k]) {
						delete updated[k];
						}
					});

					return updated;
				});

			} catch (error) {
				console.error("Failed to fetch basic details", error);
			} finally {
				setLoading(false);
			}
		};
		fetchBasicDetails();
	}, [candidateId]);

	const parsedClass = (field) => parsedFields[field] ? "border-primary" : "";

	const clearFieldError = (field) => {
		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated[field];
			return updated;
		});
	};

	useEffect(() => {
		if (!aadhaarName || !isNewAadhaarUpload) return;
		setFormData(prev => ({
			...prev,
			fullNameAadhar: aadhaarName
		}));
		setIsAadhaarLocked(true);
	}, [aadhaarName, isNewAadhaarUpload]);

	useEffect(() => {
		if (!aadhaarDob || !isNewAadhaarUpload) return;
		const normalizedDob = normalizeDate(aadhaarDob);
		setFormData(prev => ({
			...prev,
			dob: normalizedDob
		}));

		setFormErrors(prev => ({
			...prev,
			dob: ""
		}));

		setTouched(prev => ({
			...prev,
			dob: true
		}));
	}, [aadhaarDob, isNewAadhaarUpload]);

	useEffect(() => {
		if (!candidateId || !communityDoc?.docCode) return;
		const fetchCommunity = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(candidateId, communityDoc.docCode);
				setExistingCommunityDoc(res?.data || null);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchCommunity();
	}, [candidateId, communityDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !birthDoc?.docCode) return;

		const fetchBirth = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(candidateId, birthDoc.docCode);
				setExistingBirthDoc(res?.data || null);
			} catch (err) {
				console.error("Birth cert fetch failed", err);
			} finally {
				setLoading(false);
			}
		};
		fetchBirth();
	}, [candidateId, birthDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !disabilityDoc?.docCode) return;

		const fetchDisability = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(candidateId, disabilityDoc.docCode);
				setExistingDisabilityDoc(res?.data || null);
			} catch (err) {
				console.error("Disability Certificate fetch failed", err);
			} finally {
				setLoading(false);
			}
		};
		fetchDisability();
	}, [candidateId, disabilityDoc?.docCode]);

	useEffect(() => {
		if (!candidateId || !serviceDoc?.docCode) return;

		const fetchService = async () => {
			setLoading(true);
			try {
				const res = await profileApi
					.getDocumentDetailsByCode(candidateId, serviceDoc.docCode);
				setExistingServiceDoc(res?.data || null);
			} catch (err) {
				console.error("Service Certificate fetch failed", err);
			} finally {
				setLoading(false);
			}
		};
		fetchService();
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
		// if (file.size > 2 * 1024 * 1024) {
		// 	toast.error("File size must be under 2MB");
		// 	input.value = "";
		// 	return;
		// }
		if (!validateFile({ file, errorPrefix: "Community Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			const validateresoponse = await validateDoc("COMMUNITY_CERT", file);
			console.log(validateresoponse)
			if (!validateresoponse || validateresoponse?.success === false) {
				toast.error(validateresoponse?.data?.message || "Invalid Community Certificate");
				input.value = "";
				return;
			}
			setCommunityFile(file);
			setIsDirty(true);
			clearFieldError("communityCertificate");
		} finally {
			setLoading(false);
		}
		input.value = "";
	};
	const handleCommunityBrowse = () => {
		document.getElementById("communityCertificate").click();
	};

	const handleDisabilityFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;
		if (!validateFile({ file, errorPrefix: "Disability Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			const validateresoponse = await validateDoc("DISABILITY", file);
			if (!validateresoponse || validateresoponse?.success === false) {
				toast.error(validateresoponse?.data?.message || "Invalid Disability Certificate");
				input.value = "";
				return;
			}

			setDisabilityFile(file);
			setIsDirty(true);
		} finally {
			setLoading(false);
		}
		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.disabilityCertificate;
			return updated;
		});
	};

	const handleDisabilityBrowse = () => {
		document.getElementById("disabilityCertificate").click();
	};

	const handleServiceFileChange = (e) => {
		const input = e.currentTarget || e.target;
		const file = e.target.files[0];
		if (!file) return;

		if (!validateFile({ file, errorPrefix: "Service Certificate" })) {
			input.value = "";
			return;
		}

		setServiceFile(file);
		setIsDirty(true);

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated.serviceCertificate;
			return updated;
		});
	};

	const handleServiceBrowse = () => {
		document.getElementById("serviceCertificate").click();
	};

	const handleBirthFileChange = async (e) => {
		const input = e.currentTarget || e.target;
		const file = input.files && input.files[0];
		if (!file) return;

		if (!validateFile({ file, errorPrefix: "Birth / Board Certificate" })) {
			input.value = "";
			return;
		}

		setLoading(true);
		try {
			let validationResponse = await validateDoc("BIRTH_CERT", file);

			// If Birth Cert fails, try Board
			if (!validationResponse || validationResponse?.success === false) {
				validationResponse = await validateDoc("BOARD", file);
			}

			// If both fail → reject
			if (!validationResponse || validationResponse?.success === false) {
				toast.error(
					validationResponse?.data?.message ||
					"Invalid Birth Certificate or 10th Certificate"
				);
				input.value = "";
				return;
			}

			// Either Birth or Board passed
			setBirthFile(file);
			setIsDirty(true);
			clearFieldError("birthCertificate");

		} finally {
			setLoading(false);
			input.value = ""; // allow re-upload of same file
		}
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

	const handleNameKeyDown = (e) => {
		const { key } = e;
		// Allow control/navigation keys
		if (
			key === "Backspace" ||
			key === "Delete" ||
			key === "ArrowLeft" ||
			key === "ArrowRight" ||
			key === "Tab"
		) {
			return;
		}
		// Block everything except letters + space
		if (!isAllowedNameChar(key)) {
			e.preventDefault();
		}
	};

	const handleChange = (e) => {
		const { id, value } = e.target;
		let updatedValue = value;

		if (NAME_FIELDS.has(id)) {
			updatedValue = value; // allow spaces while typing
		}

		setFormData(prev => ({
			...prev,
			[id]: updatedValue
		}));

		setIsDirty(true);

		setParsedFields(prev => {
			if (!prev[id]) return prev;
			const updated = { ...prev };
			delete updated[id];
			return updated;
		});

		if (id === "fullNameAadhar" || id === "dob") {
			setTouched(prev => ({
				...prev,
				[id]: true
			}));
		}

		if (id === "contactNumber") {
			if (/^\d{10}$/.test(updatedValue)) {
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.contactNumber;
				return updated;
			});
			}
		}

		if (id === "altNumber") {
			if (/^\d{10}$/.test(updatedValue) || updatedValue === "") {
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.altNumber;
				return updated;
			});
			}
		}
	};

	const trimNameFields = (data) => {
		const trimmed = { ...data };
		NAME_FIELDS.forEach(field => {
			if (trimmed[field]) {
			trimmed[field] = trimmed[field].trim().replace(/\s+/g, " ");
			}
		});
		return trimmed;
	};

	const handleDisabilityChange = (index, field, value) => {
		setFormData(prev => ({
			...prev,
			disabilities: prev.disabilities.map((dis, i) =>
				i === index ? { ...dis, [field]: value } : dis
			)
		}));
		setIsDirty(true);

		// 🔥 CLEAR VALIDATION ERROR
		setFormErrors(prev => {
			const updated = { ...prev };

			if (field === "disabilityCategoryId") {
				delete updated[`disabilityType_${index}`];
			}

			if (field === "disabilityPercentage") {
				delete updated[`disabilityPercentage_${index}`];
			}

			return updated;
		});
	};

	const addDisability = () => {
		const lastDis = formData.disabilities[formData.disabilities.length - 1];
		const newDis = { disabilityCategoryId: "", disabilityPercentage: "" };
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

		setFormErrors(prev => {
			const updated = { ...prev };
			delete updated[`disabilityType_${index}`];
			delete updated[`disabilityPercentage_${index}`];
			return updated;
		});
	};

	const handleRadio = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value
		}));
		setIsDirty(true);
	};

	const handleCheckbox = (e) => {
		const { id, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: checked
		}));
		setIsDirty(true);
		const match = id.match(/^(language[123])/);
		if (match) {
			const langKey = match[1];

			setFormErrors(prev => {
			const updated = { ...prev };
			delete updated[`${langKey}Proficiency`];
			return updated;
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const errors = {};
		const cleanedFormData = { ...formData };
		NAME_FIELDS.forEach(field => {
			if (cleanedFormData[field]) {
			cleanedFormData[field] = cleanedFormData[field]
				.trim()
				.replace(/\s+/g, " ");
			}
		});

		// Required fields validation
		const requiredFields = [
			'firstName', 'lastName', 'fullNameAadhar', 'fullNameSSC', 'gender',
			'dob', 'cibilScore', 'maritalStatus', 'nationality', 'religion', 'category',
			'caste', 'motherName', 'fatherName', 'contactNumber', 'language1'
		];

		// Check required fields
		requiredFields.forEach(field => {
			if (!cleanedFormData[field]?.toString().trim()) {
				errors[field] = "This field is required";
			}
		});

		// ----------- DOB MISMATCH VALIDATION -----------
		if (aadhaarDob && cleanedFormData.dob) {
			if (normalizeDate(cleanedFormData.dob) !== normalizeDate(aadhaarDob)) {
				errors.dob = "Date of Birth does not match with Aadhaar";
			}
		}

		const mobile = cleanedFormData.contactNumber?.trim();

		if (mobile) {
			if (!/^\d{10}$/.test(mobile)) {
				errors.contactNumber = "Mobile number must be exactly 10 digits";
			}
		}

		const altMobile = cleanedFormData.altNumber?.trim();
		
		if (altMobile && !/^\d{10}$/.test(altMobile)) {
			errors.altNumber = "Alternate number must be exactly 10 digits";
		}

		// ---------------- NAME VALIDATION ----------------
		const NAME_ERROR = "Only alphabets and spaces are allowed";
		NAME_FIELDS.forEach(field => {
			const value = cleanedFormData[field];
			if (value && !isValidName(value)) {
			errors[field] = NAME_ERROR;
			}
		});

  // ---------------- TWIN SIBLING ----------------
  if (cleanedFormData.twinSibling) {
    if (!cleanedFormData.siblingName?.trim()) {
      errors.siblingName = "Please add twin sibling's name";
    }
    if (!cleanedFormData.twinGender) {
      errors.twinGender = "This field is required";
    }
  }

  // ---------------- DISABILITY ----------------
  if (cleanedFormData.isDisabledPerson) {
    if (cleanedFormData.disabilities.length === 0) {
      errors.disabilities = "This field is required";
    } else {
      cleanedFormData.disabilities.forEach((dis, index) => {
        if (!dis.disabilityCategoryId) {
          errors[`disabilityType_${index}`] = "Please select a disability type";
        }
        if (!dis.disabilityPercentage) {
          errors[`disabilityPercentage_${index}`] =
            "Please enter a disability percentage";
        }
      });
    }

    if (!cleanedFormData.scribeRequirement) {
      errors.scribeRequirement = "This field is required";
    }

    if (!disabilityFile && !existingDisabilityDoc) {
      errors.disabilityCertificate = "This field is required";
    }
  }

  // ---------------- EX-SERVICE ----------------
  if (cleanedFormData.isExService) {
    if (!cleanedFormData.serviceEnrollment) {
      errors.serviceEnrollment = "This field is required";
    }

    if (!cleanedFormData.dischargeDate) {
      errors.dischargeDate = "This field is required";
    }

    if (
      cleanedFormData.serviceEnrollment &&
      cleanedFormData.dischargeDate
    ) {
      const { isValid, error } = validateEndDateAfterStart(
        cleanedFormData.serviceEnrollment,
        cleanedFormData.dischargeDate
      );
      if (!isValid) {
        errors.dischargeDate = error;
      }
    }

    if (!serviceFile && !existingServiceDoc) {
      errors.serviceCertificate = "This field is required";
    }
  }

  // ---------------- DOCUMENTS ----------------
  if (!isGeneralCategory && !communityFile && !existingCommunityDoc) {
    errors.communityCertificate = "This field is required";
  }

  if (!birthFile && !existingBirthDoc) {
    errors.birthCertificate = "This field is required";
  }

  const validateLanguageProficiency = (langKey) => {
		const langSelected = cleanedFormData[langKey];
		if (!langSelected) return; // no language selected → no validation

		const read = cleanedFormData[`${langKey}Read`];
		const write = cleanedFormData[`${langKey}Write`];
		const speak = cleanedFormData[`${langKey}Speak`];

		if (!read && !write && !speak) {
			errors[`${langKey}Proficiency`] =
			"Select at least one: Read, Write, or Speak";
		}
	};

	validateLanguageProficiency("language1");
	validateLanguageProficiency("language2");
	validateLanguageProficiency("language3");

		// If there are errors, set them and return
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			const firstError = Object.keys(errors)[0];
			document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth' });
			return;
		}

		// Rest of your form submission logic...
		setLoading(true);
		try {
			const payload = mapBasicDetailsFormToApi({
				formData: cleanedFormData,
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
			setIsDirty(false);
			goNext();
		} catch (err) {
			console.error(err);
			toast.error("Failed to save basic details");
		} finally {
			setLoading(false);
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
			setFormErrors(prev => {
				const updated = { ...prev };
				delete updated.serviceEnrollment;
				delete updated.dischargeDate;
				delete updated.serviceCertificate;
				return updated;
			});

			setFormData(prev => ({
				...prev,
				serviceEnrollment: "",
				dischargeDate: "",
				servicePeriod: ""
			}));

			setServiceFile(null);
		}
	}, [formData.isExService]);

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
		if (aadhaarName) {
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

			setIsAadhaarLocked(true);
		} else {
			setIsAadhaarLocked(false);
		}
	}, [aadhaarName]);

	useEffect(() => {
		if (isAadhaarLocked || aadhaarName) return;
		const combined = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');
		setFormData(prev => ({ ...prev, fullNameAadhar: combined }));
	}, [formData.firstName, formData.middleName, formData.lastName, isAadhaarLocked, aadhaarName]);

	useEffect(() => {
		if (!parsedData?.personal?.name) return;

		const parts = parsedData.personal.name.trim().split(/\s+/);

		const firstName = parts[0] || "";
		const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
		const middleName =
			parts.length > 2 ? parts.slice(1, -1).join(" ") : "";

		setFormData(prev => ({
			...prev,
			firstName: prev.firstName || firstName,
			middleName: prev.middleName || middleName,
			lastName: prev.lastName || lastName
		}));

		setParsedFields(prev => ({
			...prev,
			...(firstName && !prev.firstName ? { firstName: true } : {}),
			...(middleName && !prev.middleName ? { middleName: true } : {}),
			...(lastName && !prev.lastName ? { lastName: true } : {})
		}));
		}, [parsedData]);

	return {
		formData,
		setFormData,
		formErrors,
		setFormErrors,
		masterData,
		candidateProfileId,
		communityFile,
		setCommunityFile,
		existingCommunityDoc,
		setExistingCommunityDoc,
		disabilityFile,
		setDisabilityFile,
		existingDisabilityDoc,
		setExistingDisabilityDoc,
		serviceFile,
		setServiceFile,
		existingServiceDoc,
		setExistingServiceDoc,
		birthFile,
		setBirthFile,
		existingBirthDoc,
		setExistingBirthDoc,
		touched,
		setTouched,
		isNameMismatch,
		isDobMismatch,
		isAadhaarLocked,
		setIsAadhaarLocked,
		selectedCategory,
		isGeneralCategory,
		getAvailableLanguages,
		handleCommunityFileChange,
		handleCommunityBrowse,
		handleDisabilityFileChange,
		handleDisabilityBrowse,
		handleServiceFileChange,
		handleServiceBrowse,
		handleBirthFileChange,
		validateDoc,
		handleBirthBrowse,
		formatFileSize,
		handleChange,
		handleDisabilityChange,
		addDisability,
		removeDisability,
		handleRadio,
		handleCheckbox,
		handleSubmit,
		calculateServicePeriodInMonths,
		parsedClass,
		handleNameKeyDown,
		getAvailableDisabilityTypes,
		loading,
		isDirty
	};
};