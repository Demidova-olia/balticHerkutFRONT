import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../services/CategoryService'
import { useState, useEffect } from 'react'
import styles from './AdminCategories.module.css'
import { Category } from '../../../types/category'
import { useNavigate, Link } from 'react-router-dom'
import { AdminNavBar } from '../../../components/Admin/AdminNavBar'

const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
        setLoading(false)
      } catch (error) {
        console.log("🚀 ~ fetchCategories ~ error:", error)
        setError('Error fetching categories')
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategory) return
    setAddingCategory(true)
    try {
      const addedCategory = await createCategory({ name: newCategory })
      setCategories(prevCategories => [...prevCategories, addedCategory])
      setNewCategory('')
    } catch (error) {
      console.log("🚀 ~ handleAddCategory ~ error:", error)
      setError('Error adding category')
    } finally {
      setAddingCategory(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id)
        setCategories(prevCategories => prevCategories.filter(category => category._id !== id))
      } catch (error) {
        console.log("🚀 ~ handleDeleteCategory ~ error:", error)
        setError('Error deleting category')
      }
    }
  }

  const handleEditCategory = async (id: string, name: string) => {
    const newName = prompt('Enter a new category name:', name)
    if (newName && newName !== name) {
      try {
        const updatedCategory = await updateCategory(id, { name: newName })
        setCategories(prevCategories =>
          prevCategories.map(cat => (cat._id === id ? updatedCategory : cat))
        )
      } catch (error) {
        console.log("🚀 ~ handleEditCategory ~ error:", error)
        setError('Error editing category')
      }
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <>
      <div className={styles.adminCategories}>
        <h2 className={styles.heading}>Manage Categories</h2>
        <AdminNavBar />
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className={styles.inputField}
          />
          <button
            onClick={handleAddCategory}
            disabled={addingCategory}
            className={`${styles.button} ${styles.addButton}`}
          >
            {addingCategory ? 'Adding...' : 'Add Category'}
          </button>
        </div>
        <ul className={styles.categoryList}>
          {categories.map((category) => (
            <li key={category._id} className={styles.categoryItem}>
              <div className={styles.categoryContent}>
                {category.name} <span className={styles.categoryId}>({category._id})</span>
              </div>
              <div className={styles.categoryActions}>
                <button
                  onClick={() => handleEditCategory(category._id, category.name)}
                  className={`${styles.button} ${styles.editButton}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category._id)}
                  className={`${styles.button} ${styles.deleteButton}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.backButton}>
        <button onClick={() => navigate(-1)} className={`${styles.button} ${styles.backBtn}`}>
          Go Back
        </button>

        <Link to="/" className={`${styles.button} ${styles.mainMenuBtn}`}>
          Go to Main Menu
        </Link>
      </div>
    </>
  )
}

export default AdminCategories
