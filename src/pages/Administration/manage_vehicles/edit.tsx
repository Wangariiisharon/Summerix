// import { Field, Form, Formik } from "formik";

// export default function EditVehicleForm({ selectedVehicle, handleSubmit, handleCancel }:any) {
//     return (
//         <Formik
//             initialValues={
//                 selectedVehicle
//                     ? {
//                           name: selectedVehicle.name,
//                           make_and_model: selectedVehicle.make_and_model,
//                           cargo_capacity: selectedVehicle.cargo_capacity,
//                           lisence_plate: selectedVehicle.label_lisence_plate,
//                           vehicle_type: selectedVehicle.vehicle_type,
//                           color: selectedVehicle.color

//                       }
//                     : {
//                           name: '',
//                           make_and_model: '', 
//                           cargo_capacity: "",
//                          lisence_plate: "",
//                          vehicle_type: "",
//                         color: "",
//                       }
//             }
//             onSubmit={handleSubmit}
//         >
//             {({ values }) => (
//                 <Form>
//                     {/* ... Render your form fields ... */}
//                     <Field type="text" name="name" value={values.name} />
//                     <Field type="text" make_and_model="make_and_model" value={values.make_and_model} />
//                     <Field type="text" cargo_capacity="cargo_capacity" value={values.cargo_capacity} />
//                     <Field type="text" lisence_plate="lisence_plate" value={values.lisence_plate} />
//                     <Field type="text" vehicle_type="vehicle_type" value={values.vehicle_type} />
//                     <Field type="text" color="color" value={values.color} />

//                     {/* ... other form fields ... */}

//                     <div className="flex w-full justify-end mt-24">
//                         <button type="button" onClick={handleCancel}>
//                             Cancel
//                         </button>
//                         <button type="submit">Save</button>
//                     </div>
//                 </Form>
//             )}
//         </Formik>
//     );
// }


