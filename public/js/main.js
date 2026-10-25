// Fill the edit form from the clicked recipe.
document.querySelectorAll('.edit-recipe').forEach((button) => {
  button.addEventListener('click', () => {
    const form = document.querySelector('#editModal form');
    for (const field of ['id', 'title', 'ingredients', 'directions']) {
      form.elements[field].value = button.dataset[field];
    }
  });
});

// Delete after confirming, then reload the list.
document.querySelectorAll('.delete-recipe').forEach((button) => {
  button.addEventListener('click', async () => {
    if (!confirm(`Delete "${button.dataset.title}"?`)) return;
    const res = await fetch(`/delete/${encodeURIComponent(button.dataset.id)}`, { method: 'DELETE' });
    if (res.ok || res.status === 404) {
      window.location.reload();
    } else {
      alert('Could not delete the recipe. Please try again.');
    }
  });
});
