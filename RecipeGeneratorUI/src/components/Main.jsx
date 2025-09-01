

export default function Main() {
  return (
    <main>
        <form className="ingredient-form">
        <input type="text" id="txtIngredient" aria-label="Add Ingredient" placeholder="e.g. Tomato" />
        <button id="btnAddIngredient">Add Ingredient</button>
        </form>
    </main>
  )
}