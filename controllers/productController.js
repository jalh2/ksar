const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
}).single('image');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};
        
        const products = await Product.find(query)
            .sort({ createdAt: -1 });
            
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
            
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Please upload an image' });
            }

            const { name, price, category, description } = req.body;

            const product = await Product.create({
                name,
                price,
                category,
                description,
                image: `/uploads/products/${req.file.filename}`
            });

            res.status(201).json(product);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            const updates = {
                name: req.body.name || product.name,
                price: req.body.price || product.price,
                category: req.body.category || product.category,
                description: req.body.description || product.description
            };

            if (req.file) {
                updates.image = `/uploads/products/${req.file.filename}`;
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true, runValidators: true }
            );

            res.json(updatedProduct);
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.remove();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
