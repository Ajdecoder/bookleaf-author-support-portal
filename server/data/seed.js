
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/user.model");
const Book = require("../models/books.model");
const Ticket = require("../models/ticket.model");

const dataset = require("../data/bookleaf_sample_data.json");

async function seedUsers() {
  for (const author of dataset.authors) {
    let user = await User.findOne({
      email: author.email,
    });

    if (!user) {
      user = new User({
        name: author.name,
        email: author.email,
        authorId: author.author_id,
        role: "author",
      });

      await user.setPassword(
        process.env.SEED_AUTHOR_PASSWORD || "Author@123"
      );  
    } else {
      user.name = author.name;
      user.authorId = author.author_id;
      user.role = "author";
    }

    await user.save();
  }

  // // Create admin if it doesn't exist.
  // let admin = await User.findOne({
  //   email: "admin@bookleaf.com",
  // });

  // if (!admin) {
  //   admin = new User({
  //     name: "BookLeaf Admin",
  //     email: "admin@bookleaf.com",
  //     role: "admin",
  //   });

  //   await admin.setPassword("admin@123");

  //   await admin.save();
  // }

  console.log("Users seeded");
}

async function seedBooks() {
  for (const author of dataset.authors) {
    for (const book of author.books) {
      const bookData = {
        id: book.book_id,
        authorId: author.author_id,
        title: book.title,
        isbn: book.isbn,
        genre: book.genre,
        publicationDate: book.publication_date,
        status: book.status,
        mrp: book.mrp,
        authorRoyaltyPerCopy: book.author_royalty_per_copy,
        totalCopiesSold: book.total_copies_sold,
        totalRoyaltyEarned: book.total_royalty_earned,
        royaltyPaid: book.royalty_paid,
        royaltyPending: book.royalty_pending,
        lastRoyaltyPayoutDate: book.last_royalty_payout_date,
        printPartner: book.print_partner,
        availableOn: book.available_on,
      };

      const user = await User.findOne({
        authorId: author.author_id,
      });

      bookData.author = user._id;

      await Book.findOneAndUpdate(
        { id: book.book_id },
        bookData,
        { upsert: true, runValidators: true }
      );
    }
  }

  console.log("Books seeded");
}

async function seedTickets() {
  const conversations = [
    {
      subject: "Royalty payout clarification",
      description: "I would like to understand my pending royalty payout.",
      category: "Royalty & Payments",
      priority: "High",
      messages: [
        ["author", "I would like an update on my pending royalty payout."],
        ["admin", "We are reviewing your royalty statement and will update you shortly."],
        ["author", "Thank you. Please share the expected payout date as well."],
      ],
    },
    {
      subject: "Book availability issue",
      description: "My book is not available on the expected online store.",
      category: "Distribution & Availability",
      priority: "Medium",
      messages: [
        ["author", "My book is showing as unavailable online."],
        ["admin", "We will check the distribution listing and investigate."],
      ],
    },
    {
      subject: "Printing quality concern",
      description: "Some pages in my author copies have printing issues.",
      category: "Printing & Quality",
      priority: "High",
      messages: [
        ["author", "Some pages in my copies appear blurry."],
        ["admin", "Please share photos so our production team can investigate."],
        ["author", "I will share the photos shortly."],
      ],
    },
    {
      subject: "Book production status",
      description: "Please provide an update on my book's production.",
      category: "Book Status & Production Updates",
      priority: "Medium",
      messages: [
        ["author", "Could you share the current production status?"],
        ["admin", "Your book is being reviewed by our production team."],
      ],
    },
    {
      subject: "Royalty statement request",
      description: "I need clarification regarding my royalty statement.",
      category: "Royalty & Payments",
      priority: "Low",
      messages: [
        ["author", "Could you provide my latest royalty statement?"],
        ["admin", "We will check the available statement and assist you."],
      ],
    },
    {
      subject: "ISBN and metadata correction",
      description: "I need help checking my book's listing information.",
      category: "ISBN & Metadata Issues",
      priority: "Medium",
      messages: [
        ["author", "Some information on my book listing needs to be checked."],
        ["admin", "Please specify the details that need correction."],
      ],
    },
    {
      subject: "Book distribution query",
      description: "I would like to confirm my book's distribution coverage.",
      category: "Distribution & Availability",
      priority: "Low",
      messages: [
        ["author", "Which online platforms currently list my book?"],
        ["admin", "We will verify the active distribution channels for your title."],
      ],
    },
    {
      subject: "General publishing inquiry",
      description: "I have a question about the publishing process.",
      category: "General Inquiry",
      priority: "Low",
      messages: [
        ["author", "I have a question about the publishing process."],
        ["admin", "Sure, please share more details so we can help."],
      ],
    },
    {
      subject: "Pending book updates",
      description: "I need an update on my book's current status.",
      category: "Book Status & Production Updates",
      priority: "Medium",
      messages: [
        ["author", "Please let me know if there are any updates."],
        ["admin", "We are checking the latest status with the relevant team."],
      ],
    },
    {
      subject: "Royalty calculation query",
      description: "I need help understanding my royalty calculation.",
      category: "Royalty & Payments",
      priority: "Medium",
      messages: [
        ["author", "Could you explain how my royalties were calculated?"],
        ["admin", "We will review the sales figures and royalty calculation."],
      ],
    },
  ];

  for (let i = 0; i < dataset.authors.length; i++) {
    const author = dataset.authors[i];
    const conversation = conversations[i];

    // Choose a book belonging to this author.
    const book = author.books[0];

    const userMessages = conversation.messages.map(
      ([sender, message], index) => ({
        id: `seed-msg-${i + 1}-${index + 1}`,
        sender,
        senderName:
          sender === "author" ? author.name : "BookLeaf Support",
        message,
        createdAt: new Date(
          Date.UTC(2026, 9, 10 + i, 10, 0 + index * 5)
        ),
      })
    );

    const lastReplyAt =
      userMessages[userMessages.length - 1].createdAt;

    await Ticket.findOneAndUpdate(
      { id: `TCK-${1001 + i}` },
      {
        $set: {
          id: `TCK-${1001 + i}`,
          authorId: author.author_id,
          bookId: book.book_id,
          subject: conversation.subject,
          description: conversation.description,
          category: conversation.category,
          priority: conversation.priority,
          status: "In Progress",
          assignedTo: null,
          internalNotes: [],
          messages: userMessages,
          lastReplyAt,
          resolvedAt: null,
        },
        $setOnInsert: {
          createdAt: new Date(
            Date.UTC(2026, 9, 10 + i, 9, 0)
          ),
        },
      },
      { upsert: true, runValidators: true }
    );
  }

  console.log("Tickets and messages seeded for all authors");
}

// seedTickets()

async function runSeed() {
  try {
    await connectDB();
    await seedUsers();
    await seedBooks();

    console.log("Seeding completed");
    process.exitCode = 0;
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  }
}

// runSeed();
