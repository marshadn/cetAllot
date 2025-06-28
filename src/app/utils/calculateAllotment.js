export const calculateAllotment = (applications, departments) => {
  const MAX_DISTANCE = 70;
  const MIN_MARK = 45;
  const MIN_EXPERIENCE = 1;

  const getCategoryKey = (app) => {
    const map = {
      'EWS': 'EWS', 'Ezhava': 'EZ', 'Muslim': 'M', 'OBH': 'BH',
      'Latin Catholic': 'LC', 'Dheevara': 'DV', 'Viswakarma': 'VK',
      'Kusavan': 'KN', 'OBC Christian': 'BX', 'Kudumbi': 'KU',
      'SC': 'SC', 'ST': 'ST', 'Physically Disabled': 'PD', 'Transgender': 'TG',
      'Sports': 'SPORTS', 'DTE Staff': 'STAFF', 'Central govt. employee': 'CENTRAL',
    };
    return map[app.reservationCategory] || 'SM';
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

  // Pre-process eligible applications
  const isValidRank = (rank) => {
    const num = Number(rank);
    return !isNaN(num) && Number.isFinite(num) && num >= 1;
  };

  const eligibleApplications = applications
    .filter((app) => {
      const validMark = parseFloat(app.mark) >= MIN_MARK;
      const validExperience = parseFloat(app.experience) >= MIN_EXPERIENCE;
      const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
      const validRank = isValidRank(app.letRank);
      return validDistance && validRank && validMark && validExperience;
    })
    .sort((a, b) => parseFloat(a.letRank) - parseFloat(b.letRank));

  // Detect presence of special category candidates
  const hasCandidate = (category) => {
    return eligibleApplications.some(app => getCategoryKey(app) === category);
  };

  const SPECIAL_CATEGORIES = ["TG", "PD", "SPORTS", "STAFF", "CENTRAL"];
  const SPECIAL_PRESENT = Object.fromEntries(
    SPECIAL_CATEGORIES.map((cat) => [cat, hasCandidate(cat)])
  );

  const updatedDepartments = departments.map((dept) => {
    const totalSeats = dept.totalSeats;

    const specialReservation = {
      PD: SPECIAL_PRESENT.PD ? Math.ceil(totalSeats * 0.05) : 0,
      TG: SPECIAL_PRESENT.TG ? 1 : 0,
      SPORTS: SPECIAL_PRESENT.SPORTS ? 1 : 0,
      STAFF: SPECIAL_PRESENT.STAFF ? 1 : 0,
      CENTRAL: SPECIAL_PRESENT.CENTRAL ? 1 : 0,
    };

    const fixedSeats = Object.values(specialReservation).reduce((a, b) => a + b, 0);
    const nonreservedSeats = totalSeats - fixedSeats;

    const seatDistribution = {
      ...specialReservation,
      SM: Math.floor(nonreservedSeats * 0.5),
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

    // Adjust leftover to SM
    const filledSeats = Object.values(seatDistribution).reduce((a, b) => a + b, 0);
    const leftover = totalSeats - filledSeats;
    if (leftover > 0) seatDistribution.SM += leftover;

    return {
      ...dept,
      allottedStudents: [],
      filledSeats: 0,
      smSeatsFilled: 0,
      smSeatLimit: seatDistribution.SM,
      seatDistribution,
      categorySeatsFilled: Object.fromEntries(
        Object.keys(seatDistribution).map((key) => [key, 0])
      ),
    };
  });

  const allotments = new Map();

  // Step 1: SM Allotment
  for (const app of eligibleApplications) {
    const choices = extractChoices(app);
    for (const choice of choices) {
      const dept = updatedDepartments.find((d) => d.name === choice);
      if (!dept) continue;

      if (dept.smSeatsFilled < dept.seatDistribution.SM) {
        dept.smSeatsFilled++;
        dept.filledSeats++;
        dept.allottedStudents.push(app.id);
        allotments.set(app.id, { ...app, allottedDepartment: dept.name });
        break;
      }
    }
  }

  // Step 2: Reservation Allotment
  for (const app of eligibleApplications) {
    if (allotments.has(app.id)) continue;

    const categoryKey = getCategoryKey(app);
    const choices = extractChoices(app);

    for (const choice of choices) {
      const dept = updatedDepartments.find((d) => d.name === choice);
      if (!dept) continue;

      const tryAllot = (catKey) => {
        if (
          dept.seatDistribution[catKey] > 0 &&
          dept.categorySeatsFilled[catKey] < dept.seatDistribution[catKey]
        ) {
          dept.categorySeatsFilled[catKey]++;
          dept.filledSeats++;
          dept.allottedStudents.push(app.id);
          allotments.set(app.id, { ...app, allottedDepartment: dept.name });
          return true;
        }
        return false;
      };

      let allotted = false;

      if (SPECIAL_CATEGORIES.includes(categoryKey)) {
        allotted = tryAllot(categoryKey) || tryAllot("SM");
      } else if (categoryKey === "ST") {
        allotted =
          tryAllot("ST") || tryAllot("SC") || tryAllot("EZ") || tryAllot("SM");
      } else if (categoryKey === "SC") {
        allotted =
          tryAllot("SC") || tryAllot("ST") || tryAllot("EZ") || tryAllot("SM");
      } else if (
        ["EZ", "M", "BH", "LC", "DV", "VK", "KN", "BX", "KU"].includes(
          categoryKey
        )
      ) {
        allotted = tryAllot(categoryKey) || tryAllot("SM");
      } else if (categoryKey === "EWS") {
        allotted = tryAllot("EWS") || tryAllot("SM");
      } else {
        allotted = tryAllot("SM");
      }

      if (allotted) break;
    }
  }

  return {
    updatedApplications: applications.map((app) => {
      const allot = allotments.get(app.id);
      return {
        ...app,
        allotmentStatus: allot ? "allotted" : "not_allotted",
        allottedDepartment: allot?.allottedDepartment || null,
      };
    }),
    updatedDepartments,
  };
};
