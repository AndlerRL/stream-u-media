
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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

          <div className="px-4 py-6">
            <p>Event stats go here</p>
          </div>


          <div className="flex gap-4 items-center justify-center">
            <Drawer nested onClose={() => setOpenComments(false)}>
              <DrawerTrigger asChild>
                <Button variant="outline" onClick={() => setOpenComments(!openComments)}>
                  {openComments ? "Close" : "Open"} comments
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm py-8">
                  <ul className="flex flex-col gap-3">
                    <li>Comment 1</li>
                    <li>Comment 2</li>
                    <li>Comment 3</li>
                  </ul>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="destructive">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>


            <Drawer nested onClose={() => setOpenComments(false)}>
              <DrawerTrigger asChild>
                <Button variant="outline" onClick={() => setOpenComments(!openComments)}>
                  {openComments ? "Close" : "Open"} Share Links
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm py-8">
                  <ul className="flex justify-evenly">
                    <li>Link 1</li>
                    <li>Link 2</li>
                    <li>Link 3</li>
                  </ul>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="destructive">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

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
