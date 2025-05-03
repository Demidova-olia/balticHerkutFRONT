import React from "react";
import { useParams } from "react-router-dom";
import ProductForm from "../../../components/Admin/AdminProductForm"

const AdminProductEdit: React.FC = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Edit Product</h2>
      {id && <ProductForm />}
    </div>
  );
};

export default AdminProductEdit;
