
import { useState } from 'react';

export default function Main() {
  const [ingredients, setIngredients] = useState([]);
  const [input, setInput] = useState("");

  function handleInputChange(e) {
    setInput(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      AddIngredient(e);
    }
  }

  function AddIngredient(e) {
    e.preventDefault();
    if (input.trim() !== "") {
      setIngredients([...ingredients, input.trim()]);
      setInput("");
    }
  }

  return (
    <main>
      <form className="ingredient-form" onSubmit={AddIngredient}>
        <div id="ingredient-input-row">
          <span id="ingredient-tip">
            Tip: Press <b>Tab</b> or <b>Enter</b> to add
          </span>
          <input
            type="text"
            id="txtIngredient"
            aria-label="Add Ingredient"
            placeholder="e.g. Tomato"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

        </div>
        <button type="submit" id="btnAddIngredient">Add Ingredient</button>
      </form>
  <ul id="ingredient-list">
        {ingredients.map((ingredient, idx) => (
          <li key={idx} id={`ingredient-item-${idx}`}>
            <span id={`ingredient-edit-row-${idx}`}>
              <input
                id={`ingredient-edit-${idx}`}
                type="text"
                value={ingredient}
                onChange={e => {
                  const newIngredients = [...ingredients];
                  newIngredients[idx] = e.target.value;
                  setIngredients(newIngredients);
                }}
                onFocus={e => e.target.select()}
              />
              <a
                id={`ingredient-remove-${idx}`}
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setIngredients(ingredients.filter((_, i) => i !== idx));
                }}
              >remove</a>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}