const Contact = require("../models/contact");

const getFullContact = async (req, res) => {
    try {
        let uid = req.body.userId
        const contacts = await Contact.find({AccountID:uid, IsActive:true}).lean();
        res.json(contacts);
    } catch (err){
        console.log(err)
    }
};


const getSingleContact = async (req, res) => {
    try {
        const contact = await Contact.findOne(
            {_id: req.params.id} 
        ).lean();
        res.json(contact);
    } catch (err){
        console.log(err)
    }
};

const contactEdit = async (req, res) => {
    res.send("contactEdit")
    console.log("contactEdit")
};

const contactCreate = async (req, res) => {

    const contact = new Contact({
        AccountID:req.body.AccountID,
        Company:req.body.Company,
        Email:req.body.Email,
        FullName:req.body.FullName,
        Home:req.body.Home,
        IsActive:false,
        JobTitle:req.body.JobTitle,
        Notes:req.body.Notes,
        PhoneNumber:req.body.PhoneNumber,
        Tags:req.body.Tags
    });
    contact.save((err)=>{
        if (err){
            res.json({
                status: 400,
                msg: "create fail"
            });
        }
        else {
            res.json({
                status: 200,
                msg: "create success"
            });
        }
    });
}

const searching = async (req, res) => {
    res.send("searching")
    console.log("searching")
};  
const getDeletedItems = async (req, res)=> {
    res.send("getDeletedItems")
    console.log("getDeletedItems")
};

module.exports = {getFullContact, getSingleContact,contactEdit,contactCreate,searching,getDeletedItems}