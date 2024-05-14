const result = {
    totals: {
        images: 392228,
        treatments: 0,
        species: 226137,
        journals: 1975
    },
    yearlyCounts: [
        {
            "year": "2009",
            "num_of_images": 1,
            "num_of_treatments": 1,
            "num_of_species": 1,
            "num_of_journals": 1
        },
        {
            "year": "2015",
            "num_of_images": 1917,
            "num_of_treatments": 1183,
            "num_of_species": 1033,
            "num_of_journals": 8
        },
        {
            "year": "2016",
            "num_of_images": 89487,
            "num_of_treatments": 40359,
            "num_of_species": 24584,
            "num_of_journals": 61
        },
        {
            "year": "2017",
            "num_of_images": 18047,
            "num_of_treatments": 7595,
            "num_of_species": 5876,
            "num_of_journals": 98
        },
        {
            "year": "2018",
            "num_of_images": 12914,
            "num_of_treatments": 5399,
            "num_of_species": 4287,
            "num_of_journals": 34
        },
        {
            "year": "2019",
            "num_of_images": 25467,
            "num_of_treatments": 11220,
            "num_of_species": 8246,
            "num_of_journals": 112
        },
        {
            "year": "2020",
            "num_of_images": 37829,
            "num_of_treatments": 16301,
            "num_of_species": 11688,
            "num_of_journals": 147
        },
        {
            "year": "2021",
            "num_of_images": 121958,
            "num_of_treatments": 54296,
            "num_of_species": 31020,
            "num_of_journals": 131
        },
        {
            "year": "2022",
            "num_of_images": 36218,
            "num_of_treatments": 15204,
            "num_of_species": 11076,
            "num_of_journals": 130
        },
        {
            "year": "2023",
            "num_of_images": 40713,
            "num_of_treatments": 17754,
            "num_of_species": 12642,
            "num_of_journals": 180
        },
        {
            "year": "2024",
            "num_of_images": 7677,
            "num_of_treatments": 3258,
            "num_of_species": 2616,
            "num_of_journals": 86
        }
    ]
};

const initialValue = {
    images: 0,
    treatments: 0,
    species: 0,
    journals: 0
};

const accumulator = ( totals , cur ) => {
    totals.images += cur.num_of_images;
    totals.treatments += cur.num_of_treatments;
    totals.species += cur.num_of_species;
    totals.journals += cur.num_of_journals;
    return totals;
};

const totals = result.yearlyCounts.reduce(accumulator, initialValue);

console.log(totals)