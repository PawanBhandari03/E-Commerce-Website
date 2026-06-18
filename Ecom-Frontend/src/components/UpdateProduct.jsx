import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductAndImage = async () => {
      try {
        // 1. Fetch product details
        const productResponse = await axios.get(`/product/${id}`);
        const productData = productResponse.data;

        // Format date to yyyy-MM-dd for the date input
        let formattedDate = "";
        if (productData.releaseDate) {
          formattedDate = new Date(productData.releaseDate)
            .toISOString()
            .split("T")[0];
        }

        setProduct({
          ...productData,
          releaseDate: formattedDate,
        });

        // 2. Fetch product image
        if (productData.imageName) {
          const imageResponse = await axios.get(`/product/${id}/image`, {
            responseType: "blob",
          });
          const blob = imageResponse.data;
          
          // Create File object from blob to keep the original image
          const imageFile = new File([blob], productData.imageName, {
            type: blob.type,
          });
          setImage(imageFile);
          setImagePreview(URL.createObjectURL(blob));
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Error loading product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndImage();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const formattedProduct = {
      ...product,
      price: Number(product.price),
      stockQuantity: Number(product.stockQuantity),
    };

    const formData = new FormData();
    formData.append("imageFile", image);
    formData.append(
      "product",
      new Blob([JSON.stringify(formattedProduct)], {
        type: "application/json",
      })
    );

    axios
      .put(`/product/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        console.log("Product updated:", res.data);
        alert("Product updated successfully");
        navigate(`/product/${id}`);
      })
      .catch((err) => {
        console.error("Error updating product:", err);
        alert("Error updating product");
      });
  };

  if (loading) {
    return (
      <h2 className="text-center" style={{ padding: "10rem" }}>
        Loading Product Details...
      </h2>
    );
  }

  return (
    <div className="container">
      <div className="center-container">
        <form className="row g-3 pt-5" onSubmit={submitHandler}>
          <h2 className="text-center mb-4">Update Product</h2>

          <div className="col-md-6">
            <label className="form-label"><h6>Name</h6></label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label"><h6>Brand</h6></label>
            <input
              type="text"
              className="form-control"
              name="brand"
              value={product.brand}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label"><h6>Description</h6></label>
            <textarea
              className="form-control"
              name="description"
              rows="3"
              value={product.description || ""}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div className="col-md-5">
            <label className="form-label"><h6>Price ($)</h6></label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={product.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label"><h6>Category</h6></label>
            <select
              className="form-select"
              name="category"
              value={product.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>
              <option value="Laptop">Laptop</option>
              <option value="Headphone">Headphone</option>
              <option value="Mobile">Mobile</option>
              <option value="Electronics">Electronics</option>
              <option value="Toys">Toys</option>
              <option value="Fashion">Fashion</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label"><h6>Stock Quantity</h6></label>
            <input
              type="number"
              className="form-control"
              name="stockQuantity"
              value={product.stockQuantity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label"><h6>Release Date</h6></label>
            <input
              type="date"
              className="form-control"
              name="releaseDate"
              value={product.releaseDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label"><h6>Image</h6></label>
            <input
              type="file"
              className="form-control"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-3">
                <h6>Current Image Preview:</h6>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "150px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "5px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            )}
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={product.productAvailable}
                onChange={(e) =>
                  setProduct({ ...product, productAvailable: e.target.checked })
                }
              />
              <label className="form-check-label">
                Product Available
              </label>
            </div>
          </div>

          <div className="col-12 d-flex gap-2 mb-5">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/product/${id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
