const { log } = require('console');
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(cors())

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({id: commentId, content, status: 'pending'});
    commentsByPostId[req.params.id] = comments;

    await axios.post('http://localhost:4005/events', {
        type: 'COMMENT',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'      
        }
    }).catch(err => {
        console.log(err.message);
    }); 

    res.status(201).send(comments)
});

app.post('/events', async (req, res) => {
    console.log('Received Event', req.body.type);

    const {type, data} = req.body;

    if (type === 'COMMENT_MODERATED') {
        const { id,postId,status, content } = data;

        const comments = commentsByPostId[postId];
        const commentToUpdate = comments.find(comment => {
            return comment.id === id;
        })

        commentToUpdate.status = status;

        await axios.post('http://localhost:4005/events', {
            type: 'COMMENT_UPDATED',
            data: {
                id, status, postId, content
            }
        }).catch(err => {
            console.log(err.message);
        });
    }

    res.send({});
});

app.listen(4001, () => {
    log('Listening in port 4001')
})