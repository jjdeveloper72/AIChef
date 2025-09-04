
import { useState, useRef, useEffect } from 'react';

export default function Main() {
  const [ingredients, setIngredients] = useState([
            'Tomato', 'Onion', 'Garlic', 'Chicken', 'Beef', 'Carrot', 'Potato', 'Salt'
          ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const [activeInputIdx, setActiveInputIdx] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      // Hide suggestions if click is outside any input or dropdown
      if (!e.target.closest('input') && !e.target.closest('#ingredient-suggestions')) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  async function handleInputChange(e, idx = null) {
    const value = e.target.value;
    if (idx === null) {
      setInput(value);
    } else {
      const newIngredients = [...ingredients];
      newIngredients[idx] = value;
      setIngredients(newIngredients);
    }
    setActiveInputIdx(idx);
    if (value.length > 3) {
      try {
        const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(value)}&search_simple=1&action=process&json=1`);
        const data = await res.json();
        if (data && data.products && data.products.length > 0) {
          // Extract ingredient names from product data
          const foundIngredients = [];
          data.products.forEach(product => {
            if (product.ingredients_text) {
              product.ingredients_text.split(',').forEach(i => {
                const clean = i.trim();
                if (clean && !foundIngredients.includes(clean)) {
                  foundIngredients.push(clean);
                }
              });
            }
          });
          setSuggestions(foundIngredients.slice(0, 8));
          setShowSuggestions(true);
        } else {
          // fallback sample suggestions
          setSuggestions([
            'Tomato', 'Onion', 'Garlic', 'Chicken', 'Beef', 'Carrot', 'Potato', 'Salt'
          ].filter(s => s.toLowerCase().includes(value.toLowerCase())));
          setShowSuggestions(true);
        }
      } catch {
        setSuggestions([
          'Tomato', 'Onion', 'Garlic', 'Chicken', 'Beef', 'Carrot', 'Potato', 'Salt'
        ].filter(s => s.toLowerCase().includes(value.toLowerCase())));
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleKeyDown(e, idx = null) {
    if (e.key === "Tab") {
      e.preventDefault();
      if (idx === null) {
        AddIngredient(e);
      }
    }
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      const firstSuggestion = document.getElementById('ingredient-suggestion-0');
      if (firstSuggestion) firstSuggestion.focus();
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function AddIngredient(e) {
    e.preventDefault();
    const newItem = capitalize(input.trim());
    if (input.trim() !== "") {
      if (!ingredients.includes(newItem)) {
        setIngredients([...ingredients, newItem]);
      }
      setInput("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function selectSuggestion(suggestion) {
    setSuggestions([]);
    setShowSuggestions(false);
    if (activeInputIdx === null) {
      setInput("");
      inputRef.current.focus();
      const newItem = capitalize(suggestion.trim());
      if (newItem && !ingredients.includes(newItem)) {
        setIngredients([...ingredients, newItem]);
      }
    } else {
      const newIngredients = [...ingredients];
      newIngredients[activeInputIdx] = capitalize(suggestion.trim());
      setIngredients(newIngredients);
      setActiveInputIdx(null);
      document.getElementById(`ingredient-edit-${activeInputIdx}`)?.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    AddIngredient(e);
  }
  
  const [showRecipe, setShowRecipe] = useState(false);

  function getRecipe() {
    // Call the recipe generation API with the selected ingredients
    setShowRecipe(prev => !prev);
  }

  return (
    <main>
  <form className="ingredient-form" onSubmit={handleSubmit}>
        <div id="ingredient-input-row" style={{ position: 'relative' }}>
          <span id="ingredient-tip">
            Tip: Press <b>Tab</b> or <b>Enter</b> to add
          </span>
          <input
            type="text"
            id="txtIngredient"
            aria-label="Add Ingredient"
            placeholder="e.g. Tomato"
            value={input}
            onChange={e => handleInputChange(e, null)}
            onKeyDown={e => handleKeyDown(e, null)}
            autoComplete="off"
            ref={inputRef}
            onFocus={() => setActiveInputIdx(null)}
          />
          {showSuggestions && suggestions.length > 0 && activeInputIdx === null && (
            <ul id="ingredient-suggestions" style={{ position: 'absolute', top: '2.5rem', left: '80px', background: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 10, width: '220px', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  id={`ingredient-suggestion-${i}`}
                  tabIndex={0}
                  style={{ padding: '6px 12px', cursor: 'pointer' }}
                  onClick={() => selectSuggestion(s)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                      selectSuggestion(s);
                    } else if (e.key === 'ArrowDown') {
                      const next = document.getElementById(`ingredient-suggestion-${i + 1}`);
                      if (next) next.focus();
                    } else if (e.key === 'ArrowUp') {
                      const prev = document.getElementById(`ingredient-suggestion-${i - 1}`);
                      if (prev) prev.focus();
                      else inputRef.current.focus();
                    }
                  }}
                >{s}</li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" id="btnAddIngredient" onClick={AddIngredient}>Add Ingredient</button>
      </form>
    {ingredients.length > 0 && (
      <section>
        <h2>Ingredients On Hand:</h2>
        <ul id="ingredient-list">
            {ingredients.map((ingredient, idx) => (
            <li key={idx} id={`ingredient-item-${idx}`}>
                <span id={`ingredient-edit-row-${idx}`} style={{ position: 'relative', display: 'inline-block' }}>
                <input
                    id={`ingredient-edit-${idx}`}
                    type="text"
                    value={ingredient}
                    onChange={e => handleInputChange(e, idx)}
                    onKeyDown={e => handleKeyDown(e, idx)}
                    onFocus={e => { setActiveInputIdx(idx); e.target.select(); }}
                />
                {showSuggestions && suggestions.length > 0 && activeInputIdx === idx && (
                    <ul id="ingredient-suggestions" style={{ position: 'absolute', top: '2.5rem', left: 0, background: 'white', border: '1px solid #ccc', borderRadius: '4px', zIndex: 10, width: '220px', maxHeight: '180px', overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                    {suggestions.map((s, i) => (
                        <li
                        key={s}
                        id={`ingredient-suggestion-${i}`}
                        tabIndex={0}
                        style={{ padding: '6px 12px', cursor: 'pointer' }}
                        onClick={() => selectSuggestion(s)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                            selectSuggestion(s);
                            } else if (e.key === 'ArrowDown') {
                            const next = document.getElementById(`ingredient-suggestion-${i + 1}`);
                            if (next) next.focus();
                            } else if (e.key === 'ArrowUp') {
                            const prev = document.getElementById(`ingredient-suggestion-${i - 1}`);
                            if (prev) prev.focus();
                            else document.getElementById(`ingredient-edit-${idx}`)?.focus();
                            }
                        }}
                        >{s}</li>
                    ))}
                    </ul>
                )}
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
        <span
          className="clear-items"
          onClick={() => setIngredients([])}
        >Clear items</span>
        </section>
      )}
      {ingredients.length > 3 && (
        <section>
            <div className='get-recipe-container'>
                <div>
                    <h3>Ready for a recipe?</h3>
                    <p>Generate a recipe from your list of ingredients.</p>
                </div>
                <button id="btnGetRecipe" onClick={() => getRecipe() } disabled={ingredients.length < 3}>Get Recipe</button>
            </div>
            {showRecipe && (
            <div className='recipe-container'>
                <div>
                    <p>                        
Chef Claude Recommends:
Based on the ingredients you have available, I would recommend making a simple a delicious Beef Bolognese Pasta. Here is the recipe:

Beef Bolognese Pasta
Ingredients:
1 lb. ground beef
1 onion, diced
3 cloves garlic, minced
2 tablespoons tomato paste
1 (28 oz) can crushed tomatoes
1 cup beef broth
1 teaspoon dried oregano
1 teaspoon dried basil
Salt and pepper to taste
8 oz pasta of your choice (e.g., spaghetti, penne, or linguine)
Instructions:
Bring a large pot of salted water to a boil for the pasta.
In a large skillet or Dutch oven, cook the ground beef over medium-high heat, breaking it up with a wooden spoon, until browned and cooked through, about 5-7 minutes.
Add the diced onion and minced garlic to the skillet and cook for 2-3 minutes, until the onion is translucent.
Stir in the tomato paste and cook for 1 minute.
Add the crushed tomatoes, beef broth, oregano, and basil. Season with salt and pepper to taste.
Reduce the heat to low and let the sauce simmer for 15-20 minutes, stirring occasionally, to allow the flavors to meld.
While the sauce is simmering, cook the pasta according to the package instructions. Drain the pasta and return it to the pot.
Add the Bolognese sauce to the cooked pasta and toss to combine.
Serve hot, garnished with additional fresh basil or grated Parmesan cheese if desired.
                    </p>

                </div>
            </div>
            )}
        </section>
      )}
    </main>
  );
}