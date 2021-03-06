const express = require('express');
const moment = require('moment');
const db = require('./connection/db')

const app = express();
const PORT = 80;

const isLogin = true;
const projects = [];


app.set('view engine', 'hbs');
app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));


app.listen(PORT, () => {
    console.log('Server running on PORT:', PORT);
});

function getProjectDuration(endDate, startDate){
    const end = new Date(endDate);
    const start = new Date(startDate);

    let duration;

    if (start < end) {
        duration = new Date(end - start);
    }

    let years = (duration.getFullYear() - 1970);
    let months = duration.getMonth();
    let days = duration.getDate();

    let yearTxt = "year";
    let monthTxt = "month";
    let dayTxt = "day";

    if (years > 1) yearTxt += "s";
    if (months > 1) monthTxt += "s";
    if (days > 1) dayTxt += "s";

    if (years >= 1) {
      duration = `${years} ${yearTxt} ${months} ${monthTxt} ${days} ${dayTxt}`;
    } else if (months >= 1) {
       duration = `${months} ${monthTxt} ${days} ${dayTxt}`;
    } else {
        duration = `${days} ${dayTxt}`;
    } return duration;
}

function durationDate(startDate, endDate){
    const start = new Date(startDate);
    const end = new Date(endDate);

    const durationDate = `${moment(start).format('DD MMM YYYY')} - ${moment(end).format('DD MMM YYYY')}`;
    return durationDate;
}

// ========================= END PREPARATION ==========================================

app.get('/', (req, res) => {
    db.connect((err, client, done) => {
        if (err) throw err;
    
        const query = 'SELECT * FROM tb_projects';

        client.query(query, (err, result) => {
            if (err) throw err;

            const projectsData = result.rows;
            const newProject = projectsData.map((project) => {
                return {
                ...project,
                distanceDate: getProjectDuration(project.end_date, project.start_date),
                durationDate: durationDate(project.start_date, project.end_date),
                isLogin,
                }
            });
            
            res.render('index', { isLogin, projects, project: newProject });
        });
        done();
    });
});

app.get('/contact', (req, res) => {
    res.render('contact-me', { isLogin });
});


app.get('/add-project', (req, res) => {
    res.render('project', { isLogin });
});

app.post('/add-project', (req, res) => {

    const title = req.body.projectName
    const start_date = req.body.startDate
    const end_date = req.body.endDate
    const description = req.body.description
    const technologies = []
    const image = req.body.image

    if (req.body.nodeJs) {
        technologies.push('nodeJs');
    } else {
        technologies.push('')
    }
    if (req.body.reactJs) {
        technologies.push('reactJs');
    } else {
        technologies.push('')
    }
    if (req.body.android) {
        technologies.push('android');
    } else {
        technologies.push('')
    }
    if (req.body.java) {
        technologies.push('java');
    } else {
        technologies.push('')
    }

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `INSERT INTO tb_projects (project_name, start_date, end_date, description, technologies, image) 
                       VALUES ('${title}', '${start_date}', '${end_date}', '${description}', ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], '${image}')`
        
        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/')
        });
        done();
    })
});

app.get('/project-detail/:id', (req, res) => {
    let id = req.params.id

    db.connect(function(err, client, done) {
        if (err) throw err;
        const query = `SELECT * FROM tb_projects WHERE id = ${id}`;

        client.query(query, function(err, result) {
            if (err) throw err;

            const projectDetail = result.rows[0];

            projectDetail.duration = getProjectDuration(projectDetail.end_date, projectDetail.start_date)
            projectDetail.start_date = moment(projectDetail.start_date).format('DD MMM YYYY')
            projectDetail.end_date = moment(projectDetail.end_date).format('DD MMM YYYY')
            
            res.render('project-detail', { isLogin, project: projectDetail })
        });

        done();
    });
});

app.get('/delete-project/:id', (req, res) => {

    let id = req.params.id

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `DELETE FROM tb_projects WHERE id = ${id};`;

        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/');
        });

        done();
    });
});

app.get('/update-project/:id', (req, res) => {
    let id = req.params.id

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `SELECT * FROM tb_projects WHERE id= ${id};`

        client.query(query, function(err, result) {
            if (err) throw err;

            const projectData = result.rows[0];
            projectData.start_date = moment(projectData.start_date).format('YYYY-MM-DD')
            projectData.end_date = moment(projectData.end_date).format('YYYY-MM-DD')
            console.log(projectData);

            res.render('update-project', {update: projectData, id})
        })
        done();
    })
});

app.post('/update-project/:id', (req, res) => {
    let id = req.params.id

    const title = req.body.projectName
    const start_date = req.body.startDate
    const end_date = req.body.endDate
    const description = req.body.description
    const technologies = []
    const image = req.body.image

    if (req.body.nodeJs) {
        technologies.push('nodeJs');
    } else {
        technologies.push('')
    }
    if (req.body.reactJs) {
        technologies.push('reactJs');
    } else {
        technologies.push('')
    }
    if (req.body.android) {
        technologies.push('android');
    } else {
        technologies.push('')
    }
    if (req.body.java) {
        technologies.push('java');
    } else {
        technologies.push('')
    }

    db.connect(function(err, client, done) {
        if (err) throw err;

        const query = `UPDATE tb_projects 
                       SET project_name = '${title}', start_date = '${start_date}', end_date = '${end_date}', description = '${description}', technologies = ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], image='${image}' 
                       WHERE id=${id};`

        client.query(query, function(err, result) {
            if (err) throw err;

            res.redirect('/')
        })
        done();
    })
});
