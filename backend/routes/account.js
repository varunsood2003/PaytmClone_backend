const express = require('express');
const { authMiddleware } = require('../middlewear');
const { Account } = require('../models/db');
const zod = require("zod")
const router = express.Router();

const transferBody= zod.object({
    to: zod.string(),
    amount: zod.number()
})

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer",authMiddleware,async(req,res)=>{
    const {success} = transferBody.safeParse(req.body);
    if(!success){
        return res.json({
            message: "invalid inputs for to or account"
        })
    }
    const {to, amount}= req.body;
    const account = await Account.findOne({
        userId: req.userId
    })
    if(account.balance < amount){
        return res.status(400).json({
            message: "Insufficient balance"
        })
    } 
    const toAccount = await Account.findOne({
        userId: to
    });
    if (!toAccount) {
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    await Account.updateOne({
        userId: req.userId
    }, {
        $inc: {
            balance: -amount
        }
    })

    await Account.updateOne({
        userId: to
    }, {
        $inc: {
            balance: amount
        }
    })

    res.json({
        message: "Transfer successful"
    })
});

module.exports = router;