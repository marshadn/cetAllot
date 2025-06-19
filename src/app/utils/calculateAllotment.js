export const calculateAllotment = (applications, departments) => {
    const MAX_DISTANCE = 70;
  
    const reservationQuota = {
      EWS: 10, EZ: 9, M: 8, BH: 3, LC: 3, DV: 2,
      VK: 1, KN: 1, BX: 1, KU: 1, SC: 8, ST: 2,
      PD: 5, TG: 1, SPORTS: 1, STAFF: 1, CENTRAL: 1,
    };
  
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
  
    const updatedDepartments = departments.map((dept) => {
      const totalSeats = dept.totalSeats;
      
      
      
      const specialReservation = {
        PD: Math.ceil(totalSeats * 0.05),
        TG: 1,
        SPORTS: 1,
        STAFF: 1,
        CENTRAL: 1,
      };
      
      const fixedSeats =
      specialReservation.TG +
      specialReservation.PD +
      specialReservation.SPORTS +
      specialReservation.STAFF +
      specialReservation.CENTRAL;
      
      const nonreservedSeats = totalSeats - fixedSeats;      
      const smSeats = Math.floor(nonreservedSeats * 0.5); // 50%
      const remainingSeats = nonreservedSeats - smSeats;

    const seatDistribution = {
    SM: Math.floor(nonreservedSeats* 0.5),
    EWS: Math.floor(nonreservedSeats* 0.1),
    SC: Math.floor(nonreservedSeats* 0.08),
    ST: Math.floor(nonreservedSeats* 0.02),
    ...specialReservation,
  };
  
  // SEBC: Total 30%
  const sebcTotal = Math.floor(nonreservedSeats * 0.3);
  seatDistribution["EZ"] = Math.floor(sebcTotal * 0.3);   // 9%
  seatDistribution["M"] = Math.floor(sebcTotal * 0.2667); // 8%
  seatDistribution["BH"] = Math.floor(sebcTotal * 0.1);   // 3%
  seatDistribution["LC"] = Math.floor(sebcTotal * 0.1);   // 3%
  seatDistribution["DV"] = Math.floor(sebcTotal * 0.0667); // 2%
  seatDistribution["VK"] = Math.floor(sebcTotal * 0.0667); // 2%
  seatDistribution["KN"] = Math.floor(sebcTotal * 0.0333); // 1%
  seatDistribution["BX"] = Math.floor(sebcTotal * 0.0333); // 1%
  seatDistribution["KU"] = Math.floor(sebcTotal * 0.0333); // 1%
  
      // Adjust any leftover seats
      const filled = Object.values(seatDistribution).reduce((a, b) => a + b, 0);
      if (filled < remainingSeats) seatDistribution.SM = remainingSeats - filled;
  
      return {
        ...dept,
        allottedStudents: [],
        filledSeats: 0,
        smSeatsFilled: 0,
        smSeatLimit: smSeats,
        seatDistribution,
        categorySeatsFilled: Object.fromEntries(
    Object.keys(seatDistribution).map((key) => [key, 0])
  ),
  
      };
    });
  
    const isValidRank = (rank) => {
      const num = Number(rank);
      return !isNaN(num) && Number.isFinite(num) && num >= 1;
    };
  
    const eligibleApplications = applications
      .filter((app) => {
        const validDistance = parseFloat(app.distance) <= MAX_DISTANCE;
        const validRank = isValidRank(app.letRank);
        const valid = validDistance && validRank;
  
        if (!valid) {
          // console.log(⛔ Skipping ${app.name || app.id} — distance: ${app.distance}, rank: ${app.letRank});
        }
        return valid;
      })
      .sort((a, b) => parseFloat(a.letRank) - parseFloat(b.letRank)); // Lower rank = higher priority
  
    const allotments = new Map();
  
    // ----------- Step 1: State Merit (SM) Allotment -------------
    let smCount = 0;
    for (const app of eligibleApplications) {
      if (smCount >= 45) break;
  
      const choices = extractChoices(app);
      for (const choice of choices) {
        const dept = updatedDepartments.find((d) => d.name === choice);
        if (!dept) continue;
  
        if (dept.smSeatsFilled < dept.smSeatLimit) {
          dept.smSeatsFilled++;
          dept.filledSeats++;
          dept.allottedStudents.push(app.id);
          allotments.set(app.id, { ...app, allottedDepartment: dept.name });
          smCount++;
          // console.log(✅ [SM] Allotted ${app.name || app.id} to ${dept.name});
          break;
        }
      }
    }
  
    // ----------- Step 2: Reservation Quota Allotment -------------
    for (const app of eligibleApplications) {
      if (allotments.has(app.id)) continue;
  
      const categoryKey = getCategoryKey(app);
      const choices = extractChoices(app);
      for (const choice of choices) {
        const dept = updatedDepartments.find((d) => d.name === choice);
        if (!dept) continue;
  
        const tryAllot = (catKey) => {
          if (dept.categorySeatsFilled[catKey] < dept.seatDistribution[catKey]) {
            dept.categorySeatsFilled[catKey]++;
            dept.filledSeats++;
            dept.allottedStudents.push(app.id);
            allotments.set(app.id, { ...app, allottedDepartment: dept.name });
            // console.log(✅ [${catKey}] Allotted ${app.name || app.id} to ${dept.name});
            return true;
          }
          return false;
        };
  
        let allotted = false;
  
        if (['TG', 'SPORTS', 'STAFF', 'CENTRAL', 'PD'].includes(categoryKey)) {
          allotted = tryAllot(categoryKey) || tryAllot('SM');
        } else if (categoryKey === 'ST') {
          allotted = tryAllot('ST') || tryAllot('SC') || tryAllot('EZ') || tryAllot('SM');
        } else if (categoryKey === 'SC') {
          allotted = tryAllot('SC') || tryAllot('ST') || tryAllot('EZ') || tryAllot('SM');
        } else if (['EZ', 'M', 'BH', 'LC', 'DV', 'VK', 'KN', 'BX', 'KU'].includes(categoryKey)) {
          allotted = tryAllot(categoryKey) || tryAllot('SM');
        } else if (categoryKey === 'EWS') {
          allotted = tryAllot('EWS') || tryAllot('SM');
        } else {
          allotted = tryAllot('SM');
        }
  
        if (allotted) break;
      }
    }
  
    console.log("📊 Final Allotment Summary:");
    applications.forEach((app) => {
      const match = allotments.get(app.id);
      // console.log(- ${app.name || app.id}: ${match ? ✅ ${match.allottedDepartment} : "❌ Not Allotted"});
    });
  
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