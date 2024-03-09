<template>
  <SideBar />
  <div class="page-wrapper flex-grow-1 d-flex flex-column px-3 pt-5">
    <header>
      <h1>Passwd Pocket</h1>
    </header>
    
    <main class="flex-grow-1">
      <table id="table-pw" class="w-100">
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Username</th>
            <th scope="col">Password</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td scope="row">google</td>
            <td>myname@gmail.com</td>
            <td>passwd</td>
            <td>
              <div class="d-flex justify-content-center">
                <button class="btn btn-outline-success btn-icon"><span class="material-symbols-outlined">visibility</span></button>
                <button class="btn btn-outline-secondary btn-icon"><span class="material-symbols-outlined">edit_square</span></button>
                <button class="btn btn-outline-danger btn-icon"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
    
    <footer class="text-center py-2">
      &copy; EbinaKai 2024
    </footer>
  </div>
</template>

<script>
import SideBar from '../components/SideBar.vue';

export default {
  name: 'Home', // コンポーネントの名前
  components: {
    SideBar // ここでコンポーネントを登録
  },
  data() {
    return {
      // データプロパティ
    };
  },
  methods: {
    // メソッド
  }
}
</script>

<style scoped>
#table-pw tr {
  border-bottom: 1px solid var(--base-color-2);
}

#table-pw tr td, #table-pw tr th {
  padding: .5rem;
}

#table-pw tr th, #table-pw td {
  width: 30%;
}

#table-pw .btn-icon .material-symbols-outlined {
  font-variation-settings:
  'wght' 300
}

#table-pw tr td:hover {
  color: var(--base-color-4);
  cursor: pointer;
}
</style>