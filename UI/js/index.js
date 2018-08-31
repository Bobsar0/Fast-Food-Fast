/**Add to cart**/
let cartBtns = document.getElementsByClassName("cartBtn");
const table = document.getElementById("table")

Array.prototype.forEach.call(cartBtns, (cartBtn) => {
    cartBtn.addEventListener('click', () => {
        let btnID = cartBtn.id;
        const name = document.getElementById(`item${btnID[btnID.length -1 ]}`).innerHTML; //the last digit in the id corresponds to the last digit  in btnID
        const price = document.getElementById(`price${btnID[btnID.length -1 ]}`).innerHTML;

        //Create contents for the table data cells in each row
        const cell1 = document.createTextNode(name); 
        const cell2 = document.createTextNode(price);

        let tr = document.createElement('TR'); //create a tablerow
        let td1 = document.createElement('TD'); //create table data 
        let td2 = document.createElement('TD'); //create table data 
        td1.appendChild(cell1);
        td2.appendChild(cell2);

        let submitBtn = document.createElement("BUTTON");
        submitBtn.id = "submit"
        submitBtn.style.background = "green"
        submitBtn.style.color= "white"

        const submit = document.createTextNode("Submit Order");
        submitBtn.appendChild(submit);
        let td3 = document.createElement('TD'); //create table data 
        td3.appendChild(submitBtn)

        let cancelBtn = document.createElement("BUTTON");
        cancelBtn.id = "cancel"
        cancelBtn.style.background = "red"
        cancelBtn.style.color= "white"
        const cancel = document.createTextNode("Cancel Order");
        cancelBtn.appendChild(cancel);
        let td4 = document.createElement('TD'); //create table data 
        td4.appendChild(cancelBtn)

        let td5 = document.createElement('TD'); //create table data 
        td5.appendChild(document.createTextNode("Anonymous"))//User is anonymous till backend functionality is implemented

        tr.appendChild(td5);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4); 

        table.appendChild(tr);
    });
});