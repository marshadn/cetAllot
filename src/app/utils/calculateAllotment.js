const getCategoryKey = (app) => {
  const map = {
    'EWS': 'EWS', 'Ezhava': 'EZ', 'Muslim': 'M', 'OBH': 'BH',
    'Latin Catholic': 'LC', 'Dheevara': 'DV', 'Viswakarma': 'VK',
    'Kusavan': 'KN', 'OBC Christian': 'BX', 'Kudumbi': 'KU',
    'SC': 'SC', 'ST': 'ST', 'Physically Disabled': 'PD', 'Transgender': 'TG',
    'Sports': 'SPORTS', 'DTE Staff': 'STAFF', 'Central govt. employee': 'CENTRAL',
  };
  return map[app.category];
};

const mapDepartmentNameToKey = (name) => {
  const map = {
    "Electrical and Electronics Engineering": "ee",
    "Mechanical Engineering": "mech",
    "Civil Engineering": "ce",
  };
  return map[name] || null;
};

const extractChoices = (app) => {
  if (app.priorityChoices && typeof app.priorityChoices === 'object') {
    return Object.values(app.priorityChoices)
      .filter(Boolean)
      .map(mapDepartmentNameToKey)
      .filter(Boolean);
  }
  return [];
};  

const MAX_DISTANCE = 70;
const getMinMarkForCategory = (app) => {
  const reservedCategories = [
    "SC", "ST", "EZ", "M", "BH", "LC", "DV", "VK", "KN", "BX", "KU", "EWS",
    "PD", "TG", "SPORTS", "STAFF", "CENTRAL"
  ];
  const categoryKey = getCategoryKey(app);
  return reservedCategories.includes(categoryKey) ? 40 : 45;
};

const MIN_EXPERIENCE = 1; // Minimum experience requirement in years
const SM_SEAT_LIMIT = 15; // Fixed SM seat limit per department

const isValidRank = (letRank) => {
  const num = Number(letRank);
  return !isNaN(num) && Number.isFinite(num) && num >= 1;
};

// Helper function to get education priority
const getEducationPriority = (education) => {
  const priorityMap = {
    'Diploma': 2,
    'BSc': 3,
    'BVoc': 4,
    'BE': 1,
    'BTech': 1,
    'Other': 5 // Fallback for any other education types
  };
  return priorityMap[education] || 5; // Default to lowest priority if not found
};

const sortByEducationThenRankThenMarks = (applications) => {
  return applications.sort((a, b) => {
    // First sort by education priority
    const eduPriorityA = getEducationPriority(a.education);
    const eduPriorityB = getEducationPriority(b.education);
    
    if (eduPriorityA !== eduPriorityB) {
      return eduPriorityA - eduPriorityB; // Lower number = higher priority
    }
    
    // If education priority is same, sort by rank
    const rankA = parseFloat(a.letRank);
    const rankB = parseFloat(b.letRank);
    
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    // If rank is also same, sort by marks (assuming higher marks = better)
    return parseFloat(b.mark) - parseFloat(a.mark);
  });
};

// Helper function to check if application is eligible for allotment
const isEligibleForAllotment = (app) => {
const validMark = parseFloat(app.mark) >= getMinMarkForCategory(app);
  const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
  const validRank = isValidRank(app.letRank);
  const validExperience = parseFloat(app.experience) >= MIN_EXPERIENCE;
  return validDistance && validRank && validMark && validExperience;
};

// Helper function to check basic eligibility (without experience)
const isBasicEligible = (app) => {
const validMark = parseFloat(app.mark) >= getMinMarkForCategory(app);
  const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
  const validRank = isValidRank(app.letRank);
  return validDistance && validRank && validMark;
};

export const calculateSMAllotment = (applications, departments) => {
  // Filter eligible applications for SM allotment (including experience requirement)
  const eligibleApplications = applications
    .filter(isEligibleForAllotment);

    const sortedEligibleApplications = sortByEducationThenRankThenMarks(eligibleApplications);

  const hasCandidate = (category) => {
    return sortedEligibleApplications.some(app => getCategoryKey(app) === category);
  };

  const SEBC_CATEGORIES = ["EZ", "M", "BH", "LC", "DV", "VK", "KN", "BX", "KU"];
  const SPECIAL_CATEGORIES = ["TG", "PD", "SPORTS", "STAFF", "CENTRAL"];
  const SPECIAL_PRESENT = Object.fromEntries(
    SPECIAL_CATEGORIES.map(category => [category, hasCandidate(category)])
  );

  // Deep copy departments to avoid mutation
  const updatedDepartments = departments.map((dept) => {
    const totalSeats = dept.totalSeats;

    const specialReservation = {
      PD: SPECIAL_PRESENT.PD ? 2 : 2,
      TG: SPECIAL_PRESENT.TG ? 1 : 0,
      SPORTS: SPECIAL_PRESENT.SPORTS ? 1 : 0,
      STAFF: SPECIAL_PRESENT.STAFF ? 1 : 0,
      CENTRAL: SPECIAL_PRESENT.CENTRAL ? 1 : 0,
    };

    const fixedSeats = Object.values(specialReservation).reduce((a, b) => a + b, 0);
    const nonreservedSeats = totalSeats - fixedSeats;

    const seatDistribution = {
      ...specialReservation,
      SM: Math.min(SM_SEAT_LIMIT, Math.floor(nonreservedSeats * 0.5)), // Ensure SM doesn't exceed 15
      EWS: Math.floor(nonreservedSeats * 0.1),
    };

    // SC & ST
    const SCST = Math.floor(nonreservedSeats * 0.1);
    seatDistribution["SC"] = Math.floor(SCST * 0.8);
    seatDistribution["ST"] = SCST - seatDistribution["SC"];

    // SEBC
    const sebcTotal = Math.floor(nonreservedSeats * 0.3);
    seatDistribution["EZ"] = Math.floor(sebcTotal * 0.3);    // 9%
    seatDistribution["M"] = Math.floor(sebcTotal * 0.2667);  // 8%
    seatDistribution["BH"] = Math.floor(sebcTotal * 0.1);    // 3%
    seatDistribution["LC"] = Math.floor(sebcTotal * 0.1);    // 3%
    seatDistribution["DV"] = Math.floor(sebcTotal * 0.0667); // 2%
    seatDistribution["VK"] = Math.floor(sebcTotal * 0.0667); // 2%
    seatDistribution["KN"] = Math.floor(sebcTotal * 0.0333); // 1%
    seatDistribution["BX"] = Math.floor(sebcTotal * 0.0333); // 1%
    seatDistribution["KU"] = Math.floor(sebcTotal * 0.0333); // 1%

    // Adjust leftover to SM but respect the limit
    const filledSeats = Object.values(seatDistribution).reduce((a, b) => a + b, 0);
    const leftover = totalSeats - filledSeats;
    if (leftover > 0) {
      const currentSM = seatDistribution.SM;
      const maxAdditionalSM = SM_SEAT_LIMIT - currentSM;
      const smAddition = Math.min(leftover, maxAdditionalSM);
      seatDistribution.SM += smAddition;
      
      // If there's still leftover after SM limit, distribute to other categories
      const remainingLeftover = leftover - smAddition;
      if (remainingLeftover > 0) {
        seatDistribution.EWS += remainingLeftover;
      }
    }

    return {
      ...dept,
      allottedStudents: [],
      filledSeats: 0,
      smSeatsFilled: 0,
      smSeatLimit: seatDistribution.SM,
      seatDistribution,
      categorySeatsFilled: Object.fromEntries(
        [
          'SM', 'EWS', 'SC', 'ST', 
          ...SEBC_CATEGORIES, 
          ...SPECIAL_CATEGORIES
        ].map(cat => [cat, 0])
      ),
    };
  });

  const allotments = new Map();

  // SM Allotment - only for candidates with experience >= 1
  for (const app of sortedEligibleApplications) {
    const choices = extractChoices(app);
    for (const choice of choices) {
      const dept = updatedDepartments.find((d) => mapDepartmentNameToKey(d.name) === choice);
      if (!dept) continue;

      // Check SM seat limit strictly
      if (dept.smSeatsFilled < dept.seatDistribution.SM) {
        // console.log(Allotting ${app.name} to ${dept.name} under SM category);
        dept.smSeatsFilled++;
        dept.filledSeats++;
        dept.categorySeatsFilled.SM++;
        dept.allottedStudents.push(app.id);
        allotments.set(app.id, { 
          ...app, 
          allottedDepartment: dept.name,
          allottedCategory: "SM"
        });
        break;
      }
    }
  }

  const updatedApplications = applications.map((app) => {
    const allot = allotments.get(app.id);
    return {
      ...app,
      allotmentStatus: allot ? "allotted" : "not_allotted",
      allottedDepartment: allot?.allottedDepartment || null,
      allottedCategory: allot?.allottedCategory || null,
    };
  });

  return {
    updatedApplications,
    updatedDepartments,
    unallocatedApplications: updatedApplications.filter(app => app.allotmentStatus === "not_allotted")
  };
};

export const calculateReservationAllotment = (unallocatedApplications, departmentsFromSMAllotment) => {
  // Deep copy to avoid mutation
  const updatedDepartments = JSON.parse(JSON.stringify(departmentsFromSMAllotment));
  const allotments = new Map();

  // Filter eligible candidates from unallocated applications (including experience requirement)
  const eligibleUnallocated = unallocatedApplications.filter((app) => {
    const validMark = parseFloat(app.mark) >= getMinMarkForCategory(app);
    const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
      const validExperience = parseFloat(app.experience) >= MIN_EXPERIENCE;
    const validRank = isValidRank(app.letRank);
    const hasCategory = getCategoryKey(app) !== undefined;
    return validDistance && validRank && validMark && validExperience && hasCategory;
  });

  // Sort eligible applications by education priority and then by letRank
  const sortedEligibleUnallocated = sortByEducationThenRankThenMarks(eligibleUnallocated);


  for (const app of sortedEligibleUnallocated) {
    const categoryKey = getCategoryKey(app);
    if (!categoryKey) continue; // Skip if no valid category
    
    const choices = extractChoices(app);
    let allotted = false;
    
    for (const choice of choices) {
      const deptIndex = updatedDepartments.findIndex((d) => mapDepartmentNameToKey(d.name) === choice);
      if (deptIndex === -1) continue;
      
      const dept = updatedDepartments[deptIndex];
      
      // Primary category allocation
      if (dept.seatDistribution[categoryKey] > 0 &&
          dept.categorySeatsFilled[categoryKey] < dept.seatDistribution[categoryKey]) {
        dept.categorySeatsFilled[categoryKey]++;
        dept.filledSeats++;
        dept.allottedStudents.push(app.id);
        allotments.set(app.id, { 
          ...app, 
          allottedDepartment: dept.name,
          allottedCategory: categoryKey 
        });
        allotted = true;
        break;
      }
      
      // Special handling for SC/ST fallback
      if (!allotted && (categoryKey === "ST" || categoryKey === "SC")) {
        // Try ST first if candidate is ST
        if (categoryKey === "ST" && 
            dept.seatDistribution["ST"] > 0 &&
            dept.categorySeatsFilled["ST"] < dept.seatDistribution["ST"]) {
          dept.categorySeatsFilled["ST"]++;
          dept.filledSeats++;
          dept.allottedStudents.push(app.id);
          allotments.set(app.id, { 
            ...app, 
            allottedDepartment: dept.name,
            allottedCategory: "ST"
          });
          allotted = true;
          break;
        }
        // Try SC next if candidate is ST or SC
        else if (dept.seatDistribution["SC"] > 0 &&
                dept.categorySeatsFilled["SC"] < dept.seatDistribution["SC"]) {
          dept.categorySeatsFilled["SC"]++;
          dept.filledSeats++;
          dept.allottedStudents.push(app.id);
          allotments.set(app.id, { 
            ...app, 
            allottedDepartment: dept.name,
            allottedCategory: "SC"
          });
          allotted = true;
          break;
        }
        // Finally try EZ if SC/ST candidate
        else if (dept.seatDistribution["EZ"] > 0 &&
                dept.categorySeatsFilled["EZ"] < dept.seatDistribution["EZ"]) {
          dept.categorySeatsFilled["EZ"]++;
          dept.filledSeats++;
          dept.allottedStudents.push(app.id);
          allotments.set(app.id, { 
            ...app, 
            allottedDepartment: dept.name,
            allottedCategory: "EZ"
          });
          allotted = true;
          break;
        }
      }
      
      if (allotted) break;
    }
  }

  // Update applications with allotment results
  const finalUpdatedApplications = unallocatedApplications.map((app) => {
    const allot = allotments.get(app.id);
    return {
      ...app,
      allotmentStatus: allot ? "allotted" : "not_allotted",
      allottedDepartment: allot?.allottedDepartment || null,
      allottedCategory: allot?.allottedCategory || null,
    };
  });

  return {
    updatedApplications: finalUpdatedApplications,
    updatedDepartments
  };
};



const transformEducationData = (applications) => {
  const normalizeEducation = (educationValue) => {
    if (!educationValue || typeof educationValue !== 'string') {
      return educationValue; // Return as-is if null, undefined, or not a string
    }
    
    const education = educationValue.toLowerCase().trim();
    
    // Define education mappings with keywords
    const educationMap = {
      'Diploma': ['diploma'],
      'BSc': ['bsc', 'b.sc', 'bachelor of science', 'b sc'],
      'BVoc': ['bvoc', 'b.voc', 'bachelor of vocation', 'b voc'],
      'BE': ['be', 'b.e', 'bachelor of engineering', 'b e'],
      'BTech': ['btech', 'b.tech', 'bachelor of technology', 'b tech'],
    };
    
    // Check for each education type
    for (const [standardForm, keywords] of Object.entries(educationMap)) {
      for (const keyword of keywords) {
        if (education.includes(keyword)) {
          return standardForm;
        }
      }
    }
    
    // Return original value if no match found
    return educationValue;
  };
  
  // Transform all applications
  return applications.map(app => ({
    ...app,
    education: normalizeEducation(app.highestEducation)
  }));
};





export const calculateAllotment = (applications, departments) => {
  const transformedApplications = transformEducationData(applications);
  console.log("Transformed Applications:", transformedApplications);
  
  // Step 1: Calculate SM allotment (only for candidates with experience >= 1)
  const smResult = calculateSMAllotment(transformedApplications, departments);
  console.log("SM Allotment Result:", {
    totalAllocated: smResult.updatedApplications.filter(app => app.allotmentStatus === "allotted").length,
    unallocated: smResult.unallocatedApplications.length
  });
  
  // Step 2: Calculate reservation allotment for unallocated candidates (only those with experience >= 1)
  const reservationResult = calculateReservationAllotment(
    smResult.unallocatedApplications, 
    smResult.updatedDepartments
  );

  console.log("Reservation Allotment Result:", {
    totalAllocated: reservationResult.updatedApplications.filter(app => app.allotmentStatus === "allotted").length,
    stillUnallocated: reservationResult.updatedApplications.filter(app => app.allotmentStatus === "not_allotted").length
  });

  // Step 3: Create a map of all allotted applications for efficient lookup
  const allAllotments = new Map();
  
  // Add SM allotments
  smResult.updatedApplications
    .filter(app => app.allotmentStatus === "allotted")
    .forEach(app => allAllotments.set(app.id, app));
  
  // Add reservation allotments
  reservationResult.updatedApplications
    .filter(app => app.allotmentStatus === "allotted")
    .forEach(app => allAllotments.set(app.id, app));

  // Step 4: Create final applications array with proper status assignment
  const finalApplications = transformedApplications.map(app => {
    const allottedApp = allAllotments.get(app.id);
    
    if (allottedApp) {
      return {
        ...app, // Preserve original data
        allotmentStatus: "allotted",
        allottedDepartment: allottedApp.allottedDepartment,
        allottedCategory: allottedApp.allottedCategory
      };
    }
    
    // If not allotted, check if application is eligible for waiting list
    // if exam not attended
    if ((!isValidRank(app.letRank) || app.letRank === "NA")&& parseFloat(app.distance) <= MAX_DISTANCE &&
        parseFloat(app.mark) >= getMinMarkForCategory(app)) {
      return {
        ...app,
        letRank:99999,
        allotmentStatus: "not_eligible",
        allottedDepartment: null,
        allottedCategory: "exam_not_attended"
      };
    }

    // Check if application is otherwise eligible (mark, distance, letRank)
    
    if (!isBasicEligible(app)) {
      return {
        ...app,
        allotmentStatus: "not_eligible",
        allottedDepartment: null,
        allottedCategory: null
      };
    }

    // Check if application has insufficient experience
    if (parseFloat(app.experience) < MIN_EXPERIENCE) {
      return {
        ...app,
        allotmentStatus: "waiting_list",
        allottedDepartment: "Waiting List",
        allottedCategory: "experience_requirement"
      };
    }
    
    
    
    // For eligible but unallotted applications - assign to waiting list
    return {
      ...app,
      allotmentStatus: "waiting_list",
      allottedDepartment: "Waiting List",
      allottedCategory: "not_allotted"
    };
  });

  const statusCounts = {
    allotted: finalApplications.filter(app => app.allotmentStatus === "allotted").length,
    waiting_list: finalApplications.filter(app => app.allotmentStatus === "waiting_list").length,
    not_eligible: finalApplications.filter(app => app.allotmentStatus === "not_eligible").length,
    insufficient_experience: finalApplications.filter(app => app.allottedCategory === "experience_requirement").length,
    sm_allotted: finalApplications.filter(app => app.allottedCategory === "SM").length,
    reservation_allotted: finalApplications.filter(app => app.allottedCategory && app.allottedCategory !== "SM" && app.allottedCategory !== "not_allotted" && app.allottedCategory !== "experience_requirement").length
  };


  return {
    updatedApplications: finalApplications,
    updatedDepartments: reservationResult.updatedDepartments,
    noExamApplications: finalApplications.filter(app => app.allottedCategory === "exam_not_attended"),
    summary: statusCounts
};
};