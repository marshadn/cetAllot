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
const MIN_MARK = 45;
const SM_SEAT_LIMIT = 15; // Fixed SM seat limit per department

const isValidRank = (letRank) => {
  const num = Number(letRank);
  return !isNaN(num) && Number.isFinite(num) && num >= 1;
};

export const calculateSMAllotment = (applications, departments) => {
  // Filter eligible applications once
  const eligibleApplications = applications
    .filter((app) => {
      const validMark = parseFloat(app.mark) >= MIN_MARK;
      const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
      const validRank = isValidRank(app.letRank);
      return validDistance && validRank && validMark;
    })
    .sort((a, b) => parseFloat(a.letRank) - parseFloat(b.letRank));

  const hasCandidate = (category) => {
    return eligibleApplications.some(app => getCategoryKey(app) === category);
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

  // SM Allotment
  for (const app of eligibleApplications) {
    const choices = extractChoices(app);
    for (const choice of choices) {
      const dept = updatedDepartments.find((d) => mapDepartmentNameToKey(d.name) === choice);
      if (!dept) continue;

      // Check SM seat limit strictly
      if (dept.smSeatsFilled < dept.seatDistribution.SM) {
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

  // Filter eligible candidates from unallocated applications
  const eligibleUnallocated = unallocatedApplications.filter((app) => {
    const validMark = parseFloat(app.mark) >= MIN_MARK;
    const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
    const validRank = isValidRank(app.letRank);
    const hasCategory = getCategoryKey(app) !== undefined;
    return validDistance && validRank && validMark && hasCategory;
  }).sort((a, b) => parseFloat(a.letRank) - parseFloat(b.letRank));

  console.log(`Eligible unallocated candidates: ${eligibleUnallocated.length}`);

  for (const app of eligibleUnallocated) {
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

// Helper function to check if application is eligible
const isEligibleApplication = (app) => {
  const validMark = parseFloat(app.mark) >= MIN_MARK;
  const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
  const validRank = isValidRank(app.letRank);
  return validDistance && validRank && validMark;
};

export const calculateAllotment = (applications, departments) => {
  console.log(departments);
  
  // Step 1: Calculate SM allotment
  const smResult = calculateSMAllotment(applications, departments);
  console.log("SM Allotment Result:", {
    totalAllocated: smResult.updatedApplications.filter(app => app.allotmentStatus === "allotted").length,
    unallocated: smResult.unallocatedApplications.length
  });
  
  // Step 2: Calculate reservation allotment for unallocated candidates
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
  const finalApplications = applications.map(app => {
    const allottedApp = allAllotments.get(app.id);
    
    if (allottedApp) {
      return {
        ...app, // Preserve original data
        allotmentStatus: "allotted",
        allottedDepartment: allottedApp.allottedDepartment,
        allottedCategory: allottedApp.allottedCategory
      };
    }
    
    // Check if application is eligible
    if (!isEligibleApplication(app)) {
      return {
        ...app,
        allotmentStatus: "not_eligible",
        allottedDepartment: null,
        allottedCategory: null
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
    sm_allotted: finalApplications.filter(app => app.allottedCategory === "SM").length,
    reservation_allotted: finalApplications.filter(app => app.allottedCategory && app.allottedCategory !== "SM" && app.allottedCategory !== "not_allotted").length
  };

  console.log('Final allotment summary:', statusCounts);

  return {
    updatedApplications: finalApplications,
    updatedDepartments: reservationResult.updatedDepartments,
    summary: statusCounts
};
};