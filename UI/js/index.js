/****ADD TO CART IMPLEMENTATION****/
let cartBtns = document.getElementsByClassName("cartBtn");
const table = document.getElementById("table")

//Listen for a click event on each 'Add to Cart' button append order information to shopping cart table (modal)
Array.prototype.forEach.call(cartBtns, cartBtn=> {
    cartBtn.addEventListener('click', () => {
        let btnID = cartBtn.id;
        const name = document.getElementById(`item${btnID.slice(-2)}`).innerHTML; //the last 2-digits in the id corresponds to the last digit  in btnID
        const price = document.getElementById(`price${btnID.slice(-2)}`).innerHTML;
        alert(`${name} successfully added to cart`) //alert user of successful cart addition

        let tr = document.createElement('TR'); //create a tablerow node

        //Create contents for the table data cells in each row
        const cell1 = document.createTextNode(name); 
        const cell2 = document.createTextNode(price);

        //Create a submit order for review button
        let submitBtn = document.createElement("BUTTON"); //
        submitBtn.id = "submitOdr"
        const submit = document.createTextNode("Submit Order");
        submitBtn.appendChild(submit);

        //Create a cancel order button
        let cancelBtn = document.createElement("BUTTON");
        cancelBtn.id = "cancelOdr"
        const cancel = document.createTextNode("Cancel Order");
        cancelBtn.appendChild(cancel);

        const user = document.createTextNode("Anonymous")//User is anonymous till backend functionality is implemented

        const cells = [user, cell1, cell2, submitBtn, cancelBtn]

        cells.forEach(cell => { //append each cell to td then to tr
            let td = document.createElement('TD'); //create table data 
            td.appendChild(cell)
            tr.appendChild(td)
        })       
        table.appendChild(tr); //append to table
    });
});
