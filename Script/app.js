
//BUDGET CONTROLLER
var budgetController = (function() {
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc > 0){
            //Rounding number upto 2 decimal Places using Math.round()
            this.percentage = Math.round((this.value / totalInc * 100) * 100)/100;      
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;       
        }); 
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var ID, newItem;
            
            //Creating a new id for a new item
            if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Creating a new item

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Pushing the new item in our data Structure
            data.allItems[type].push(newItem);

            //returning the new item object
            return newItem;

        },

        deleteItem: function(type, id){
            var ids, index;
            // Creating an array of IDS from the Income or Expense Object Array named Inc or Exp in data.allitems
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            // Now finding the index of the specified ID in ids array
            index = ids.indexOf(id);
            //Deleting the found index with splice
            data.allItems[type].splice(index, 1);
        },

        calculateBudget: function(){
            // 1. Finding the Sum of Income and Expense
            calculateTotal('inc');
            calculateTotal('exp');
            // 2. Finding the total Budget
            data.budget = data.totals.inc - data.totals.exp;
            // 3. Finding the Percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc * 100) * 100) /100;
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var PercentageList = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return PercentageList;
        },
        // Just for testing Purpose
        getData:function(){
            return data;
        }

    }

})();





//UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        classSelectExp : '.expenses__list',
        classSelectInc : '.income__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container: '.container',
        ExpensePercLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };

    return {
        getinput: function() {
            return{
                type : document.querySelector(DOMstrings.inputType).value,
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };    
        },

        addItemToUI: function(obj, type){
            var newHtml,replacedHtml,classSelect;
            // We need to create a Plaeholder Html

            if(type === 'inc') {
                classSelect = DOMstrings.classSelectInc;
                newHtml = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                classSelect = DOMstrings.classSelectExp;
                newHtml = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Changing the placeholder to the data received

            replacedHtml = newHtml.replace('%id%', obj.id);
            replacedHtml = replacedHtml.replace('%description%',obj.description);
            replacedHtml = replacedHtml.replace('%value%',obj.value);

            // Adding the html in the UI
            document.querySelector(classSelect).insertAdjacentHTML('beforeend', replacedHtml);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExpense;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalIncome;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }

        },

        deleteItem: function(concernedID){
            var el = document.getElementById(concernedID);
            el.parentNode.removeChild(el);
        },
        

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.ExpensePercLabel);

            var ExpenseListForEach = function(List, callback){
                for(var i = 0; i < List.length; i++){
                    callback(List[i],i);   
                }
            };
            ExpenseListForEach(fields, function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });

        },

        displayDate: function(){
            var date = new Date();

            var monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            var month = date.getMonth();
            var year = date.getFullYear();
            document.querySelector(DOMstrings.monthLabel).textContent = monthList[month] + ", " + year;

        },


        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();






//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();   
        document.querySelector(DOM.inputBtn).addEventListener('click', CtrlAddFunction);
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13)
            {
                CtrlAddFunction();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', CtrlDeleteItem);
    }


    

    var updateBudget = function(){
 
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget(); 
        // 3. Set the budget on the User Interface 
        UICtrl.displayBudget(budget);
    };


    var updatePercentages = function(){
        // 1. Update the percentages in Budget Controller
        budgetCtrl.calculatePercentages();
        // 2. Reading the percentages
        var Percentages = budgetCtrl.getPercentages();
        // 3. Updating the UI
        UICtrl.displayPercentages(Percentages);
    };
    

    var CtrlAddFunction = function(){
        // 1.  Get the data from input field
        var input = UICtrl.getinput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add Item to UI
            UICtrl.addItemToUI(newItem, input.type);
            // 4. Clearing the fields
            UICtrl.clearFields();
        }
        
        // 5. Update the Budget
        updateBudget();
        // 6. Calculating and updating the Percentages
        updatePercentages();
    };


    var CtrlDeleteItem = function(event){
        var itemID, itemSplitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            itemSplitID = itemID.split('-');
            type = itemSplitID[0];
            ID = parseInt(itemSplitID[1]);
            
        }

        //1. Deleting the item from the Budget Controller
        budgetCtrl.deleteItem(type, ID);
        //2. Deleting the item from UI
        UICtrl.deleteItem(itemID);
        //3. Updating the Budget
        updateBudget();
        //4. Calculating and updating the Percentages
        updatePercentages();


    }

    return {
        init: function() {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalIncome: 0,
                totalExpense: 0
            });
            setUpEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();