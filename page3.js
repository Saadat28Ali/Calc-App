// Global constants and variables ----------------------------------------

const {Worker, isMainThread} = require("worker_threads");

const display_queue = [];

if (isMainThread) {

	const all_inputs = {
		oper: "^/*mod-+", 
		char: "0123456789.", 
		comm: "=C"
	};

	var has_decimal = true;
	var display_obj = document.getElementsByClassName("display_label");

	// functions -------------------------------------------------------------

	function onClose() {
		console.log("quitting");
		window.quit();
		// console.log(window);
	}

	function endOf(s) {
		return s.length - 1;
	}

	function endItemOf(s) {
		return s[s.length - 1];
	}

	function addChar(char) {

		// console.log(display_obj);

		// console.log("addChar is called with input", char);
		var curr_val = display_obj[0].innerText;
		var set_to = curr_val;

		if (all_inputs["oper"].includes(char)) {
			
			// the input is an operator

			if (all_inputs["char"].includes(endItemOf(curr_val)) && endItemOf(curr_val) !== ".") {
				// if currently, the display has a number at the end
				set_to += char;
			}
			if (all_inputs["oper"].includes(endItemOf(curr_val))) {
				// if currently, the display has an operator at the end
				set_to = curr_val.substring(0, curr_val.length - 1) + char;
			}

		}
		else if (all_inputs["char"].includes(char)) {
			
			// the input is a character (number or decimal point)
			
			if (curr_val === "0") {
				if (char === ".") {
					set_to = "0.";
				}
				else {
					set_to = char;
					has_decimal = false;
				}
			}
			else {
				if (char === ".") {
					if (!has_decimal) {
						set_to += char;
						has_decimal = true;
					}
				}
				else {
					set_to += char;
				}	
			}

		}
		else {
			// the input is either = or C
			if (char === "C") {
				set_to = "0";
				has_decimal = true;
			}
			if (char === "=") {
				set_to = calc(curr_val);
			}

			// updateDisplayFont();
		}

		// display_obj[0].innerText = set_to;
		display_queue.push(set_to);
		return;
	}

	function calc(expr) {

		// finding where the operators are

		// console.log("Current expression: ", expr);

		var oper_occurrences = {
			"^": [], 
			"/": [], 
			"*": [], 
			"mod": [], 
			"-": [], 
			"+": []
		};

		// console.log(expr);

		var skips = 0;

		for (var oper in oper_occurrences) {

			skips = 0;

			for (var char_index in expr) {

				if (skips === 0) {
					if (expr[char_index] !== "m") {		

						if (expr[char_index] === oper) {
							try {
								oper_occurrences[oper].push(char_index);
							}
							catch(err) {
								oper_occurrences[oper] = [char_index];
							}
						}
					}

					else {
						if (oper === "mod") {

							skips = 2;

							try {
								oper_occurrences[oper].push(char_index);
							}
							catch(err) {
								oper_occurrences[oper] = [char_index];
							}
						}
					}
				}

				if (skips > 0) {
					skips -= 1;
				}
			}
		}

		// console.log(oper_occurrences);

		// evaluation

		// case: no operators

		var no_operator = true;
		for (var item in oper_occurrences) {
			if (oper_occurrences[item].length !== 0) {
				no_operator = false;
				break;
			}
		}
		if (no_operator === true) {
			// console.log("here");
			return expr;
		}

		// case: operators are present

		for (var oper in oper_occurrences) {

			// iterating through every operator

			for (var oper_index_index in oper_occurrences[oper]) {

				// iterating through every instance of the current operator
				
				var actual_oper_index = oper_occurrences[oper][oper_index_index];
				// console.log("oper_index: ", actual_oper_index);

				var adjacentOperIndex = getAdjacentOperIndex(expr, actual_oper_index);
				// console.log("adjacentOperIndex: ", adjacentOperIndex);
				adjacentOperIndex[0] += 1;

				expr_substring = expr.substring(...adjacentOperIndex);
				// console.log(expr_substring);
				
				var current_solution = singularOper(expr_substring, actual_oper_index - adjacentOperIndex[0]);
				// console.log("current_solution: ", current_solution);
				
				new_expr = expr.substring(0, adjacentOperIndex[0]) + current_solution + expr.substring(adjacentOperIndex[1], expr.length);
				// console.log(new_expr);
				
				return calc(new_expr);
				
			}
		}

	}

	function singularOper(expr, oper_index) {

		// evaluates the result of a single operation
		// assumes that there are two numbers and an operator
		// present between the two numbers, all in expr
		// also assumes that there is nothing else in expr
		// for ex, trailing spaces or other numbers


		oper_index = Number(oper_index);
		var oper = expr[oper_index];

		if (oper === "m") {
			oper = "mod";
		}

		numbers = getNumFromOper(expr, oper_index);

		// console.log("numbers: ", numbers);

		switch (oper) {

			case "^":
				return String(Number(numbers[0]) ** Number(numbers[1]));
				break;
			case "/":
				return String(Number(numbers[0]) / Number(numbers[1]));
				break;
			case "*":
				return String(Number(numbers[0]) * Number(numbers[1]));
				break;
			case "mod":
				return String(Number(numbers[0]) % Number(numbers[1]));
				break;
			case "-":
				return String(Number(numbers[0]) - Number(numbers[1]));
				break;
			case "+":
				return String(Number(numbers[0]) + Number(numbers[1]));
				break;
			default:
				return expr;
		}
	}

	function getNumFromOper(expr, oper_index) {
		// returns the numbers that are present to the left and the right
		// of an operator in the given expr
		// it is assumed that the operator is present in expr at index
		// oper_index and that the expr is guaranteed to have two
		// numbers to the left and right of the operator

		oper_index = Number(oper_index);

		var index1 = 0;
		var index2 = oper_index + 1;
		var number1 = [];
		var number2 = [];
		if (expr[oper_index] === "m") {
			index2 += 2;	
		}

		while (index1 < oper_index) {
			number1.push(expr[index1]);
			index1++;
		}

		while (index2 < expr.length) {
			number2.push(expr[index2]);
			index2++;
		}

		return [number1.join(""), number2.join("")];
	}

	function getAdjacentOperIndex(expr, start_index) {
		// beginning from start_index, looks for any characters
		// in expr, of index > or < start_index, that are operators
		// returns the first adjacent operator indices
		// or 0 or length of expr is none are found

		start_index = Number(start_index); // are you fucking kidding me javascript
		var index1 = start_index - 1;
		var index2 = start_index + 1;
		var left_oper_index = -1;
		var right_oper_index = -1;

		while (true) {
			// console.log(index1, index2);
			// console.log(index1, index2);
			if (left_oper_index === -1) {
				if (!all_inputs["char"].includes(expr[index1])) {
					// found an operator to the left
					left_oper_index = index1;
				}	
			}

			if (right_oper_index === -1) {
				if (!all_inputs["char"].includes(expr[index2]) && !"od".includes(expr[index2])) {
					// found an operator to the right
					right_oper_index = index2;
				}
			}

			if (left_oper_index !== -1 && right_oper_index !== -1) {
				break;
			}
			if (index1 <= 0 && index2 >= expr.length - 1) {
				break;
			}

			if (index1 > 0) {
				index1--;
			}
			if (index2 < expr.length - 1) {
				// console.log("wha");
				index2++;
			}
		}

		// case: reached end of string without finding any operator
		if (left_oper_index === -1) {
			left_oper_index = -1;
		}
		if (right_oper_index === -1) {
			right_oper_index = expr.length;
		}

		return [left_oper_index, right_oper_index]
	}

}
else {
	while (true) {
		if (display_queue !== []) {
			display_obj[0].innerText = display_queue[0];
			display_queue.pop();	
		}
	}
		
}


console.log(display_obj);