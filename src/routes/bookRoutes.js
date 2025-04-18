import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const bookroutes = express.Router();
//Create Book
bookroutes.post("/create", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();
    return res.status(201).json(newBook);
  } catch (error) {
    console.log("Error Creating book", error);
    res.status(500).json({ message: error.message });
  }
});

//Get books
bookroutes.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1) * limit;
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//get recommendation books y the logged in user
bookroutes.get("/user", protectRoute, async (req, res) => {
  try {
    const book = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

//Delete books
bookroutes.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Unauthorized" });

    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
      }
    }

    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deletinng book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default bookroutes;
