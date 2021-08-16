// Sort transaction rows into categories based on a simple string search
exports.simple = {
    "Groceries": [
        "No Frills",
        "Superstore",
        "Loblaws"
    ]
};

// For less standard transaction rows, add a custom formula here. Formulas are called in order
// until a non-empty string is returned.
exports.tests = [
    (desc, amt) => {
        if (desc.includes('Contribution')) {
            switch (amt) {
                case -250:
                    return 'RRSP';
                case -125:
                    return 'TFSA';
            }
        }

        return '';
    }
];