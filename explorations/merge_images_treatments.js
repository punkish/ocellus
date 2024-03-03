const images = {"yearlyCounts":[{"row_num":1,"year":"2009","num_of_records":1,"cum_count":1},{"row_num":2,"year":"2015","num_of_records":1917,"cum_count":1918},{"row_num":3,"year":"2016","num_of_records":89487,"cum_count":91405},{"row_num":4,"year":"2017","num_of_records":18047,"cum_count":109452},{"row_num":5,"year":"2018","num_of_records":12914,"cum_count":122366},{"row_num":6,"year":"2019","num_of_records":25467,"cum_count":147833},{"row_num":7,"year":"2020","num_of_records":37829,"cum_count":185662},{"row_num":8,"year":"2021","num_of_records":121954,"cum_count":307616},{"row_num":9,"year":"2022","num_of_records":36218,"cum_count":343834},{"row_num":10,"year":"2023","num_of_records":40709,"cum_count":384543},{"row_num":11,"year":"2024","num_of_records":5719,"cum_count":390262}]};

const treatments = {"yearlyCounts":[{"row_num":1,"year":"1970","num_of_records":1,"cum_count":1},{"row_num":2,"year":"2009","num_of_records":12441,"cum_count":12442},{"row_num":3,"year":"2010","num_of_records":341,"cum_count":12783},{"row_num":4,"year":"2011","num_of_records":1676,"cum_count":14459},{"row_num":5,"year":"2012","num_of_records":867,"cum_count":15326},{"row_num":6,"year":"2013","num_of_records":996,"cum_count":16322},{"row_num":7,"year":"2014","num_of_records":1044,"cum_count":17366},{"row_num":8,"year":"2015","num_of_records":33553,"cum_count":50919},{"row_num":9,"year":"2016","num_of_records":143450,"cum_count":194369},{"row_num":10,"year":"2017","num_of_records":33535,"cum_count":227904},{"row_num":11,"year":"2018","num_of_records":22451,"cum_count":250355},{"row_num":12,"year":"2019","num_of_records":65939,"cum_count":316294},{"row_num":13,"year":"2020","num_of_records":78142,"cum_count":394436},{"row_num":14,"year":"2021","num_of_records":252835,"cum_count":647271},{"row_num":15,"year":"2022","num_of_records":92104,"cum_count":739375},{"row_num":16,"year":"2023","num_of_records":66448,"cum_count":805823},{"row_num":17,"year":"2024","num_of_records":16594,"cum_count":822417}]};

const imagesYc = images.yearlyCounts;
const treatmentsYc = treatments.yearlyCounts;

treatmentsYc.forEach(i => {
    const tyear = i.year;
    const ind = imagesYc.findIndex(i => i.year === tyear);
    //console.log(`ind: ${ind}`)
    if (ind === -1) {
        imagesYc.push({
            year: tyear,
            num_of_records: 0
        })
    }
})

imagesYc.sort((a, b) => {
    return a.year - b.year
})

console.log(imagesYc)