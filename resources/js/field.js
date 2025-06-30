import IndexField from './components/IndexField.vue';
import DetailField from './components/DetailField.vue';
import FormField from './components/FormField.vue';
Nova.booting((app, store) => {
  app.component('index-nova-inline-text', IndexField);
  app.component('detail-nova-inline-text', DetailField);
  app.component('form-nova-inline-text', FormField);
});
