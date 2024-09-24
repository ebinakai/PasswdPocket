<script>
export default {
  name: 'Logout',
  mounted() {
    sessionStorage.removeItem('token');
    this.$router.push('/login');
  },
}
</script>