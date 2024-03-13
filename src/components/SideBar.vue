<template>
  <aside class="pt-sm-3" :class="{'open': isSideOpen}">
    <nav>
      <ul class="list-unstyled d-flex flex-sm-column justify-content-center flex-grow-1 mb-0">
        <li><router-link to="/" class="d-block" active-class="active">
          <span class="material-symbols-outlined">home</span></router-link>
        </li>
        <li><router-link to="/trash" class="d-block" active-class="active">
          <span class="material-symbols-outlined">auto_delete</span></router-link>
        </li>
        <li><router-link to="/logout" class="d-block" active-class="active">
          <span class="material-symbols-outlined">logout</span></router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>


<script>
export default {
  name: 'SideBar',
  data() {
    return {
      isSideOpen: false, // モーダルの表示状態
    };
  },
  methods: {
    toggleSideOpen(state) {
      this.isSideOpen = state;
    }
  },
  watch: {
  },
}
</script>

<style scoped>
aside nav ul li a {
  padding: 1.5rem;
  color: var(--base-color-3);
  border-left: 5px solid transparent;
}

aside nav ul li a.active {
  border-left: 5px solid var(--theme-color-3);
}

aside nav ul li:hover a {
  color: var(--base-color-4);
}

@media screen and (max-width: 576px) {
  aside nav ul li {
    padding: 1.5rem 2rem .5rem 2rem;
  }
}
</style>