
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { useState } from "react";

export function EventCardDrawer({ drawerData, open, onClose }: { onClose: () => void, drawerData: any, open: boolean }) {
  const [openComments, setOpenComments] = useState(false);
  return (
    <Drawer open={open} onClose={onClose}>
      {/* <DrawerTrigger asChild>
        <Button variant="outline">Open Event Details</Button>
      </DrawerTrigger> */}
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm py-8">
          <DrawerHeader>
            <DrawerTitle>{drawerData?.title}</DrawerTitle>
            <DrawerDescription>{drawerData?.description}</DrawerDescription>
          </DrawerHeader>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="destructive" onClick={onClose}>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
