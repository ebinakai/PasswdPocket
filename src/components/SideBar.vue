<template>
  <aside class="pt-3">
    <nav>
      <ul class="list-unstyled">
        <li><router-link to="/"><span class="material-symbols-outlined">home</span></router-link></li>
        <li><router-link to="/login"><span class="material-symbols-outlined">login</span></router-link></li>
        <li><router-link to="/logout"><span class="material-symbols-outlined">logout</span></router-link></li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
aside nav ul li {
  padding: 1.5rem 2rem;
}

aside nav ul li a {
  color: var(--base-color-3);
}

aside nav ul li:hover a {
  color: var(--base-color-4);
}
</style>