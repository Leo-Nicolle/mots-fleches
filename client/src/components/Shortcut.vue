// need to add "lang='tsx'"
<script lang='tsx'>
import { defineComponent } from 'vue';
function vFor<T>(arr: T[], callback: (children: T, index: number, arr: T[]) => any) {
  return arr.map((v, index, arr) => {
    return callback(v, index, arr);
  });
}

export default defineComponent({
  name: 'Shortcut',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => (
      <>
        {
          vFor(props.text.split(' + '), (v, i, arr) => (
            <>
              <kbd class="kbc-button">{v}</kbd>
              {i !== arr.length - 1 ? (<span class='space'> + </span>) : null}

            </>
          ))
        }
      </>
    );
  }
});
</script>

<style lang='scss' scoped>
.space {
  font-size: 1.5em;
  margin: 0 0.5em;
}
</style>