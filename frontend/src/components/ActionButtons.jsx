// import React from "react";

// const ActionButtons = ({
//     onEdit,
//     onDelete,
//     showEdit = true,
//     showDelete = true,
//     editText = "Edit",
//     deleteText = "Delete",
// }) => {
//     return (
//         <div
//             style={{
//                 display: "flex",
//                 gap: "8px",
//                 alignItems: "center",
//             }}
//         >
//             {showEdit && (
//                 <button
//                     type="button"
//                     onClick={onEdit}
//                     style={editButtonStyle}
//                 >
//                     {editText}
//                 </button>
//             )}

//             {showDelete && (
//                 <button
//                     type="button"
//                     onClick={onDelete}
//                     style={deleteButtonStyle}
//                 >
//                     {deleteText}
//                 </button>
//             )}
//         </div>
//     );
// };

// const editButtonStyle = {
//     padding: "6px 12px",
//     border: "1px solid #0d6efd",
//     borderRadius: "5px",
//     backgroundColor: "#0d6efd",
//     color: "#fff",
//     cursor: "pointer",
//     fontSize: "14px",
// };

// const deleteButtonStyle = {
//     padding: "6px 12px",
//     border: "1px solid #dc3545",
//     borderRadius: "5px",
//     backgroundColor: "#dc3545",
//     color: "#fff",
//     cursor: "pointer",
//     fontSize: "14px",
// };

// export default ActionButtons;