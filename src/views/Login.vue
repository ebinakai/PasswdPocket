<template>
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header>
      <h1 class="text-center">Passwd Pocket</h1>
    </header>

    <main class="flex-grow-1 d-flex align-items-center justify-content-center">
      <form action="" class="py-4">
        <h2 class="text-center fs-3 mb-4">Login</h2>
        <div class="mb-4">
          <input type="email" class="form-control" placeholder="Username">
        </div>
        <div class="mb-4">
          <input type="password" class="form-control" aria-labelledby="passwordHelpBlock" placeholder="Password">
        </div>
        <div class="d-grid gap-2">
          <button class="btn btn-secondary" type="button">Pocket In</button>
        </div>
      </form>
    </main>
    
    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>
  </div>
</template>

<style scoped>
form {
  width: 100%;
  max-width: 450px;
  padding: 15px;
  margin: auto;
  border: 2px solid var(--base-color-2);
  border-radius: .5rem;
}

form h2 {
  color: var(--base-color-4);
}
</style>