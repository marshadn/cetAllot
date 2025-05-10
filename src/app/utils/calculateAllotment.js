export const calculateAllotment = (applications, departments) => {
    const MAX_DISTANCE = 70;
    const MIN_MARK = 50;
  
    const reservationQuota = {
      SM: 50, EWS: 10, EZ: 9, M: 8, BH: 3, LC: 3,
      DV: 2, VK: 1, KN: 1, BX: 1, KU: 1, SC: 2, ST: 6,
      PD: 5, TG: 0, SPORTS: 0, STAFF: 0, CENTRAL: 0,
    };
  
    const getCategoryKey = (app) => {
      const map = {
        'EWS': 'EWS', 'Ezhava': 'EZ', 'Muslim': 'M', 'OBH': 'BH',
        'Latin Catholic': 'LC', 'Dheevara': 'DV', 'Viswakarma': 'VK',
        'Kusavan': 'KN', 'OBC Christian': 'BX', 'Kudumbi': 'KU',
        'SC': 'SC', 'ST': 'ST', 'PD': 'PD', 'Transgender': 'TG',
        'Sports': 'SPORTS', 'Staff': 'STAFF', 'Central': 'CENTRAL',
      };
      return map[app.reservationCategory] || 'SM';
    };
  
    const mapDepartmentNameToKey = (name) => {
      const map = {
        "Electrical and Electronics Engineering": "ee",
        "Mechanical Engineering": "mech",
        "Civil Engineering": "me"
      };
      return map[name] || null;
    };
  
    const extractChoices = (app) => {
      if (app.priorityChoices && typeof app.priorityChoices === 'object') {
        return Object.values(app.priorityChoices)
          .filter(Boolean)
          .map(mapDepartmentNameToKey)
          .filter(Boolean); // remove nulls
      }
      return [];
    };
  
    const updatedDepartments = departments.map((dept) => {
      const seatDistribution = {};
      Object.keys(reservationQuota).forEach((key) => {
        seatDistribution[key] = Math.floor((reservationQuota[key] / 100) * dept.totalSeats);
      });
      seatDistribution.SM += dept.totalSeats - Object.values(seatDistribution).reduce((a, b) => a + b, 0);
  
      return {
        ...dept,
        allottedStudents: [],
        filledSeats: 0,
        seatDistribution,
        categorySeatsFilled: Object.fromEntries(Object.keys(reservationQuota).map((key) => [key, 0])),
      };
    });
  
    const eligibleApplications = applications
      .filter((app) => {
        const valid = parseFloat(app.distance) <= MAX_DISTANCE && parseFloat(app.mark) >= MIN_MARK;
        if (!valid) {
          console.log(`⛔ Skipping ${app.name || app.id} — distance: ${app.distance}, mark: ${app.mark}`);
        }
        return valid;
      })
      .sort((a, b) => parseFloat(b.mark) - parseFloat(a.mark));
  
    const allotments = [];
  
    for (const app of eligibleApplications) {
      const choices = extractChoices(app); // use new function
      const categoryKey = getCategoryKey(app);
  
      console.log(`🎯 ${app.name || app.id} - Category: ${categoryKey}, Choices: ${choices.join(", ")}`);
  
      for (const choice of choices) {
        const dept = updatedDepartments.find((d) => d.name === choice);
        if (!dept) continue;
  
        const tryAllot = (catKey) => {
          if (dept.categorySeatsFilled[catKey] < dept.seatDistribution[catKey]) {
            dept.categorySeatsFilled[catKey]++;
            dept.filledSeats++;
            dept.allottedStudents.push(app.id);
            allotments.push({ ...app, allottedDepartment: dept.name });
            console.log(`✅ Allotted ${app.name || app.id} to ${dept.name} under ${catKey}`);
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
      const match = allotments.find((a) => a.id === app.id);
      console.log(`- ${app.name || app.id}: ${match ? `✅ ${match.allottedDepartment}` : "❌ Not Allotted"}`);
    });
  
    return {
      updatedApplications: applications.map((app) => {
        const allot = allotments.find((a) => a.id === app.id);
        return {
          ...app,
          allotmentStatus: allot ? "allotted" : "not_allotted",
          allottedDepartment: allot?.allottedDepartment || null,
        };
      }),
      updatedDepartments,
    };
  };
  