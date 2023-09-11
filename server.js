import express, { json } from 'express'
import mysql from 'mysql2'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import * as nodemailer from 'nodemailer'

dotenv.config()
const app = express()
app.use(express.json())

const conn = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    uri: process.env.MYSQL_URL,
    port: process.env.MYSQLPORT
})

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'uniman001@gmail.com',
        pass: 'vboouqkwqoicnotw'
    }
});

app.get('/test', (req, res) => {
    res.send('This is a test')
})

// hash password
app.get("/hash/:password", (req, res) => {
    const password = req.params.password
    const saltRounds = 13

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log('Error hashing password:', err)
            const errorMessage = {
                message: 'Error hashing Password'
            }
            return res.status(500).send(errorMessage);
        } else {
            console.log('Hashed Password:', hashedPassword)
            console.log('Password hashed successfully:', hashedPassword);
            return res.send(hashedPassword);
        }
    })
})

// get courses related to student
app.get("/courses/:programme", (req, res) => {
    const programme = req.params.programme
    const query = 'SELECT * FROM courses WHERE programme = ?'

    conn.query(query, programme, (error, result) => {
        if (error) {
            console.log('Error executing query', error)
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(404).json({ message: 'Empty' });
        }
        console.log('Data fetched successfully:', result);
        return res.send(result);
    })
})

// get registered courses
app.get("/rcourses/:indexno", (req, res) => {
    const indexno = req.params.indexno
    const query = 'SELECT * FROM registered WHERE indexno = ?'

    conn.query(query, indexno, (error, result) => {
        if (error) {
            console.log('Error executing query', error)
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(404).json({ message: 'Empty' });
        }
        console.log('Data fetched successfully:', result);
        return res.send(result);
    })
})

// get all students registered under a course
app.get("/ncourses/:coursename", (req, res) => {
    const coursename = req.params.coursename
    const query = 'SELECT * FROM registered WHERE course = ?'

    conn.query(query, coursename, (error, result) => {
        if (error) {
            console.log('Error executing query', error)
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(404).json({ message: 'No student has registered for this course' });
        }
        console.log('Registered Course fetched successfully:', result);
        return res.send(result);
    })
})

// get all students
app.get("/students", (req, res) => {
    const query = 'SELECT * FROM students'

    conn.query(query, (error, result) => {
        if (error) {
            console.log('Error executing query')
            const errorMessage = {
                message: 'Error executing query'
            }
            return res.status(500).send(errorMessage);
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            const errorMessage = {
                message: 'Empty'
            }
            return res.status(404).send(errorMessage);
        }
        console.log('Data fetched successfully:', result);
        return res.send(result);
    })
})

// get student result
app.get("/getResults/:indexno", (req, res) => {
    const indexno = req.params.indexno
    const query = 'SELECT * FROM results WHERE indexno = ?'

    conn.query(query, indexno, (error, result) => {
        if (error) {
            console.log('Error executing query')
            const errorMessage = {
                message: 'Error executing query'
            }
            return res.status(500).send(errorMessage);
        }
        if (result.length === 0) {
            console.log('Empty.')
            const errorMessage = {
                message: 'Empty'
            }
            return res.status(404).send(errorMessage);
        }
        console.log('Data fetched successfully:', result);
        return res.send(result);
    })
})

// get all courses
app.get("/courses", (req, res) => {
    const query = 'SELECT * FROM courses'

    conn.query(query, (error, result) => {
        if (error) {
            console.log('Error executing query')
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(404).json({ message: 'There are no courses here' });
        }
        console.log('Data fetched successfully:', result);
        return res.send(result);
    })
})

// get one student
app.get("/students/:email", (req, res) => {
    const query = 'SELECT * FROM students WHERE email = ?'
    const email = req.params.email

    conn.query(query, [email], (error, result) => {
        if (error) {
            console.log('Error executing query')
            const errorMessage = {
                message: 'Error executing query'
            }
            return res.status(500).send(errorMessage);
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            const errorMessage = {
                message: 'Student does not exist'
            }
            return res.status(204).send(errorMessage);
        }
        console.log('Data fetched successfully:', result[0]);
        return res.send(result[0]);
    })
})

// get one lecturer
app.get("/lecturer/:email", (req, res) => {
    const query = 'SELECT * FROM lecturers WHERE email = ?'
    const email = req.params.email

    conn.query(query, [email], (error, result) => {
        if (error) {
            console.log('Error executing query')
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(204).json({ message: 'Student does not exist' });
        }
        console.log('Data fetched successfully:', result[0]);
        return res.send(result[0]);
    })
})

// confirm student forget code
app.get("/confirmCode/:email", (req, res) => {
    const query = 'SELECT code FROM students WHERE email = ?'
    const email = req.params.email

    conn.query(query, [email], (error, result) => {
        if (error) {
            console.log('Error executing query')
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(204).json({ message: 'Empty' });
        }
        console.log('Data fetched successfully:', result[0]);
        return res.send(result[0]);
    })
})

// confirm lecturer forget code
app.get("/confirmLCode/:email", (req, res) => {
    const query = 'SELECT code FROM lecturers WHERE email = ?'
    const email = req.params.email

    conn.query(query, [email], (error, result) => {
        if (error) {
            console.log('Error executing query')
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.length === 0) {
            console.log('Query returned no data. The data you are querying does not exist.')
            return res.status(204).json({ message: 'Empty' });
        }
        console.log('Data fetched successfully:', result[0]);
        return res.send(result[0]);
    })
})

// create student
app.post("/addstudents", (req, res) => {
    const { indexno, username, firstname, lastname, email, programme, year, password } = req.body
    const query = "INSERT INTO students (indexno, username, firstname, lastname, email, programme, year, password, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '')"
    const saltRounds = 13

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log('Error hashing password:', err)
            const errorMessage = {
                message: 'Error hashing Password'
            }
            return res.status(500).send(errorMessage);
        } else {

            console.log('Hashed Password:', hashedPassword)
            console.log('Password hashed successfully:', hashedPassword);

            conn.query(query, [indexno, username, firstname, lastname, email, programme, year, hashedPassword], (error, result) => {
                if (error) {
                    console.log('Error executing query')
                    return res.status(500).json({ message: 'Error executing query' });
                }
                if (result.affectedRows === 0) {
                    console.log('Student not created')
                    return res.status(409).json({ message: 'Student not created' });
                }
                console.log('Student created successfully:', result);
                return res.status(201).send(result);
            })
        }
    })
})

// create lecturer
app.post("/addlecturer", (req, res) => {
    const { username, firstname, lastname, email, phonenumber, password } = req.body
    const query = "INSERT INTO lecturers (username, firstname, lastname, email, phonenumber, password, code) VALUES (?, ?, ?, ?, ?, ?, '')"
    const saltRounds = 13

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log('Error hashing password:', err)
            const errorMessage = {
                message: 'Error hashing Password'
            }
            return res.status(500).send(errorMessage);
        } else {
            console.log('Hashed Password:', hashedPassword)
            console.log('Password hashed successfully:', hashedPassword);

            conn.query(query, [username, firstname, lastname, email, phonenumber, hashedPassword], (error, result) => {
                if (error) {
                    console.log('Error executing query', error)
                    return res.status(500).json({ message: 'Error executing query' });
                }
                if (result.affectedRows === 0) {
                    console.log('Lecturer not created')
                    return res.status(409).json({ message: 'Lecturer not created' });
                }
                console.log('Lecturer created successfully:', result);
                return res.status(201).send(result);
            })
        }
    }
    )

})

// create course
app.post("/course", (req, res) => {
    const { name, code, description, credit, programme } = req.body
    const query = 'INSERT INTO courses(name, code, details, credit, programme) VALUES (?, ?, ?, ?, ?)'

    conn.query(query, [name, code, description, credit, programme], (error, result) => {
        if (error) {
            console.log('Error executing query', error)
            return res.status(500).json({ message: 'Error executing query' });
        }
        if (result.affectedRows === 0) {
            console.log('Course not created')
            return res.status(409).json({ message: 'Course not created' });
        }
        console.log('Course created successfully:', result);
        return res.status(201).send(result);
    })
})

// register a course
app.post("/registerCourse", (req, res) => {
    const { name, coursecode, details, indexno, studentname } = req.body
    const checkQuery = 'SELECT COUNT(*) as count FROM registered WHERE coursecode = ? AND indexno = ?'
    const query = 'INSERT INTO registered(course, coursecode, details, indexno, studentname) VALUES (?, ?, ?, ?, ?)'

    conn.query(checkQuery, [coursecode, indexno], (error, result) => {
        if (error) {
            console.log('Error executing query', error)
            return res.status(500).json({ message: 'Error executing query' });
        }
        const count = result[0].count
        if (count > 0) {
            console.log('Course already registered')
            return res.status(500).json({ message: 'Course already registered' });
        } else {
            conn.query(query, [name, coursecode, details, indexno, studentname], (err, ress) => {
                if (err) {
                    console.log('Error executing query', error)
                    return res.status(500).json({ message: 'Error executing query' });
                }
                if (ress.affectedRows === 0) {
                    console.log('Course not registered')
                    return res.status(409).json({ message: 'Course not registered' });
                }
                console.log('Course registered successfully:', ress);
                return res.status(201).send(ress);
            })
        }
    })
})

// change student phoneNumber
app.post("/studentsPhone", (req, res) => {
    const { phoneNumber, email } = req.body
    const query = 'UPDATE students SET phonenumber = ? WHERE email = ?'

    conn.query(query, [phoneNumber, email], (error, result) => {
        if (error) {
            console.log('Error executing query')
            const errorMessage = {
                message: 'Error executing query'
            }
            return res.status(500).send(errorMessage);
        }
        if (result.affectedRows === 0) {
            console.log('Student phone number not updated')
            const errorMessage = {
                message: 'Student phone number not updated'
            }
            return res.status(409).send(errorMessage);
        }
        console.log('Student phone number changed successfully', result)
        return res.status(201).send(result)
    })
})

// reset student password
app.post("/resetPassword", (req, res) => {
    const { email, password } = req.body
    const query = 'UPDATE students SET password = ? WHERE email = ?'
    const saltRounds = 13

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log('Error hashing password:', err)
            const errorMessage = {
                message: 'Error hashing Password'
            }
            return res.status(500).send(errorMessage);
        } else {
            console.log('Hashed Password:', hashedPassword)
            console.log('Password hashed successfully:', hashedPassword);

            conn.query(query, [hashedPassword, email], (error, result) => {
                if (error) {
                    console.log('Error executing query')
                    return res.status(500).json({ message: 'Error executing query' });
                }
                if (result.affectedRows === 0) {
                    console.log('Student password not updated')
                    return res.status(409).json({ message: 'Student password not updated' });
                }

                console.log('Student password changed successfully', result)
                return res.status(201).send(result)
            })
        }
    })

})

// reset lecturer password
app.post("/resetLPassword", (req, res) => {
    const { email, password } = req.body
    const query = 'UPDATE lecturers SET password = ? WHERE email = ?'
    const saltRounds = 13

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.log('Error hashing password:', err)
            const errorMessage = {
                message: 'Error hashing Password'
            }
            return res.status(500).send(errorMessage);
        } else {
            console.log('Hashed Password:', hashedPassword)
            console.log('Password hashed successfully:', hashedPassword);

            conn.query(query, [hashedPassword, email], (error, result) => {
                if (error) {
                    console.log('Error executing query')
                    return res.status(500).json({ message: 'Error executing query' });
                }
                if (result.affectedRows === 0) {
                    console.log('Student password not updated')
                    return res.status(409).json({ message: 'Student password not updated' });
                }

                console.log('Student password changed successfully', result)
                return res.status(201).send(result)
            })
        }
    })

})

// update student password
app.post("/studentsPass", (req, res) => {
    const { password, email } = req.body
    const query = 'UPDATE students SET password = ? WHERE email = ?'

    conn.query(query, [password, email], (error, result) => {
        if (error) {
            console.log('Error executing query')
            const errorMessage = {
                message: 'Error executing query'
            }
            return res.status(500).send(errorMessage);
        }
        if (result.affectedRows === 0) {
            console.log('Student password not updated')
            const errorMessage = {
                message: 'Student password not updated'
            }
            return res.status(409).send(errorMessage);
        }
        console.log('Student password changed successfully', result)
        return res.status(201).send(result)
    })
})

// send a message via email
app.post("/sendMessage", (req, res) => {
    const { message, email } = req.body

    const messageBody = `
    <div>
        <p style="width: 100%; text-align: left; margin-bottom: 0px; font-size: 16px;">
        Hello,<br></br><br></br>
        You have recieved a new message from ${email} via the Uniman application.
        </p>

        <p style="width: 100%; text-left: center; margin-bottom: 0px; font-size: 16px;">
        "${message}"
        </p>
        <br></br>
        <br></br>
        <span style="font-size: 12px; opacity: .4">
        Uniman
        </span>
    <div>
    `
    const mailOptions = {
        from: 'Uniman App <uniman001@gmail.com>',
        to: 'uniman001@gmail.com',
        subject: 'Messsage From Uniman App',
        html: messageBody
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Error sending mail:', err)
            const errorMessage = {
                message: 'Error sending email'
            }
            return res.status(500).send(errorMessage);
        }
        console.log('Email sent:', info.response)
        return res.status(200).send(info);
    })

})

// send student code
app.post("/sendCode", (req, res) => {

    const { email } = req.body

    const generatedCode = Math.floor(Math.random() * 900000) + 100000;

    const messageBody = `
    <div style="display:flex; align-items: center; justify-content: flex-start; flex-direction: column; text-align: center;">
        <p style="width: 90%; text-align: center; margin-bottom: 0px;">
        Hello, </br>
        Use the code below to proceed with resetting your password.
        </p>
        <h2 style="font-size: 52px; color: #1e90ff; margin-bottom: 30px; font-weight: 500; letter-spacing: 2px;">
        ${generatedCode}
        </h2>
        <p style="font-size: 15px; color: #ffffff3; margin-bottom: 50px">
        If you did not make this request, kindly ignore this email.
        </p>
        <span style="font-size: 12px; opacity: .4">
        Uniman Team
        </span>
    </div>
    `
    const mailOptions = {
        from: 'Uniman App <uniman001@gmail.com>',
        to: email,
        subject: 'Reset Code',
        html: messageBody
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Error sending mail:', err)
            return res.status(500).json({ message: 'Error sending email' });
        }
        console.log('Email sent:', info.response)
        // return res.status(200).send(info);
        conn.query('UPDATE STUDENTS SET code = ? WHERE email = ?', [generatedCode, email], (error, result) => {
            if (error) {
                console.log('Error executing query', error)
                return res.status(500).json({ message: 'Error executing query' });
            }
            if (result.affectedRows === 0) {
                console.log('Code not adedd')
                return res.status(204).json({ message: 'Code not added' });
            }
            console.log('Code added successfully:', result[0]);
            return res.send(result[0]);
        })
    })

})

// send lecturer code
app.post("/sendLCode", (req, res) => {

    const { email } = req.body

    const generatedCode = Math.floor(Math.random() * 900000) + 100000;

    const messageBody = `
    <div style="display:flex; align-items: center; justify-content: flex-start; flex-direction: column; text-align: center;">
        <p style="width: 90%; text-align: center; margin-bottom: 0px;">
        Hello, </br>
        Use the code below to proceed with resetting your password.
        </p>
        <h2 style="font-size: 52px; color: #1e90ff; margin-bottom: 30px; font-weight: 500; letter-spacing: 2px;">
        ${generatedCode}
        </h2>
        <p style="font-size: 15px; color: #ffffff3; margin-bottom: 50px">
        If you did not make this request, kindly ignore this email.
        </p>
        <span style="font-size: 12px; opacity: .4">
        Uniman Team
        </span>
    </div>
    `
    const mailOptions = {
        from: 'Uniman App <uniman001@gmail.com>',
        to: email,
        subject: 'Reset Code',
        html: messageBody
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Error sending mail:', err)
            return res.status(500).send({ message: 'Error sending email' });
        }
        console.log('Email sent:', info.response)
        // return res.status(200).send(info);
        conn.query('UPDATE lecturers SET code = ? WHERE email = ?', [generatedCode, email], (error, result) => {
            if (error) {
                console.log('Error executing query', error)
                return res.status(500).json({ message: 'Error executing query' });
            }
            if (result.affectedRows === 0) {
                console.log('Code not adedd')
                return res.status(204).json({ message: 'Code not added' });
            }
            console.log('Code added successfully:', result[0]);
            return res.send(result[0]);
        })
    })

})

// save result
app.post("/results", (req, res) => {
    const { name, indexno, semester, course, score, grade } = req.body
    const query = 'INSERT INTO results(name, indexno, semester, course, score, grade) VALUES (?, ?, ?, ?, ?, ?)'

    conn.query(query, [name, indexno, semester, course, score, grade], (error, result) => {
        if (error) {
            console.log('Error executing query', error)
            return res.status(500).json({ message: 'Error executing query' })
        }
        if (result.affectedRows === 0) {
            console.log('Results were not uploaded')
            return res.status(409).json({ message: 'Results were not uploaded' })
        }
        console.log('Results uploaded successfully', result)
        return res.status(201).send(result)
    })
})


app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(500).send('Something Broke!')
})

const port = process.env.PORT || 3000

// listen
app.listen(port, `0.0.0.0`, () => {
    console.log(`Listening on ${port}`)
})
