import { Admin } from "@/models/admin.model";
import { User } from "@/models/user.model";
import { NextFunction, Request, Response } from "express";

export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = totalAdmins; // You can refine with a `status` field later

    res.status(200).json({ totalAdmins, activeAdmins });
  } catch (error) {
    next(error);
  }
};

export const getSubAdminList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await Admin.find().select("name email phoneNumber");

    const result = await Promise.all(
      admins.map(async (admin) => {
        const completedITRs = await User.countDocuments({
          assignedTo: admin._id,
          status: "completed",
        });

        const pendingITRs = await User.countDocuments({
          assignedTo: admin._id,
          status: "pending",
        });

        const itrStats = await User.aggregate([
          { $match: { assignedTo: admin._id } },
          {
            $group: {
              _id: "$itrType",
              count: { $sum: 1 },
            },
          },
        ]);

        const typeBreakdown: any = {};
        itrStats.forEach((itr) => {
          typeBreakdown[itr._id] = itr.count;
        });

        return {
          name: admin.name,
          email: admin.email,
          status: "Active", // can be dynamic if needed
          completedITRs,
          pendingITRs,
          typeBreakdown,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
